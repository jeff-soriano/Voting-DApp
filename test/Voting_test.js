const { expect, assert } = require("chai");

let accounts,
    manager,
    contractAsManager,
    description,
    optionADescription,
    optionBDescription,
    intendedVotingDate,
    intendedClosingDate,
    Voting,
    voting,
    voter,
    contractAsVoter,
    provider;

beforeEach(async () => {
    provider = ethers.getDefaultProvider();

    accounts = await ethers.getSigners();
    manager = accounts[0];
    voter = accounts[1];

    description = "Chocolate or vanilla?";
    optionADescription = "Chocolate";
    optionBDescription = "Vanilla";
    intendedVotingDate = Math.floor(Date.now() / 1000 + 1000);
    intendedClosingDate = Math.floor(Date.now() / 1000 + 100000);

    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(
        manager.address,
        description,
        optionADescription,
        optionBDescription,
        intendedVotingDate,
        intendedClosingDate);

    await voting.deployed();

    contractAsManager = voting.connect(manager);
    contractAsVoter = voting.connect(voter);
});

describe("Initialization", () => {
    it("Initializes the state variables correctly", async () => {
        const optionA = await voting.optionA();
        const optionB = await voting.optionB();

        expect(await voting.description()).to.equal(description);

        expect(optionA.description).to.equal(optionADescription);
        expect(optionA.count).to.equal(0);

        expect(optionB.description).to.equal(optionBDescription);
        expect(optionB.count).to.equal(0);

        expect(await voting.intendedVotingDate()).to.equal(intendedVotingDate);
        expect(await voting.actualVotingDate()).to.equal(0);

        expect(await voting.intendedClosingDate()).to.equal(intendedClosingDate);
        expect(await voting.actualClosingDate()).to.equal(0);

        expect(await voting.getVotingPhase()).to.equal("Registration");
        expect(await voting.manager()).to.equal(manager.address);
    });
});

describe("Manager functions", () => {
    it("Sets the next phase", async () => {
        expect(await voting.getVotingPhase()).to.equal("Registration");

        await voting.moveToNextPhase();
        expect(await voting.getVotingPhase()).to.equal("Voting");

        await voting.moveToNextPhase();
        expect(await voting.getVotingPhase()).to.equal("Closed");
    });

    it("Only allows the manager to set the next phase", async () => {
        // Try with manager moving to next phase
        try {
            await contractAsManager.moveToNextPhase();
            assert(true);
        } catch (error) {
            assert(false, "Manager should have been allowed to set next phase");
        }

        // Try with non-manager moving to next phase
        try {
            await contractAsVoter.moveToNextPhase();
            assert(false, "Non-manager should not have been allowed to set next phase");
        } catch (error) {
            assert(error);
        }
    });

    it("Only allows manager to set the next phase when not in Closed phase", async () => {
        try {
            // Registration -> Voting
            await voting.moveToNextPhase();
            // Voting -> Closed
            await voting.moveToNextPhase();
            // Closed -> Should throw error here
            await voting.moveToNextPhase();
            assert(false, "Should not be allowed to set next phase when in Closed phase");
        } catch (error) {
            assert(error);
        }
    });

    it("Gets the correct timestamp when moving to Voting phase", async () => {
        await voting.moveToNextPhase();

        const actualVotingDate = await voting.actualVotingDate();
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);

        // Expect the timestamps to be within a small range of each other
        // TODO: Figure out how to get the exact timestamp that matches
        // the Voting contract's
        expect(actualVotingDate - block.timestamp).to.be.below(1000);
    });

    it("Gets the correct timestamp when moving to Closed phase", async () => {
        await voting.moveToNextPhase();
        await voting.moveToNextPhase();

        const actualClosingDate = await voting.actualClosingDate();
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);

        // Expect the timestamps to be within a small range of each other
        // TODO: Figure out how to get the exact timestamp that matches
        // the Voting contract's
        expect(actualClosingDate - block.timestamp).to.be.below(1000);
    });
});

describe("Voter functions", () => {
    it("Allows an address to register to vote", async () => {
        await contractAsVoter.registerToVote();
        expect(await voting.registeredVoters(voter.address)).to.equal(true);
    });

    it("Doesn't allow you to register twice", async () => {
        try {
            await contractAsVoter.registerToVote();
            await contractAsVoter.registerToVote();
            assert(false, "Should not be allowed to register twice");
        } catch (error) {
            assert(error);
        }
    });

    it("Doesn't allow you to register when in the Voting phase", async () => {
        try {
            await voting.moveToNextPhase();
            await contractAsVoter.registerToVote();
            assert(false, "Should not be allowed to register when in Voting phase");
        } catch (error) {
            assert(error);
        }
    });

    it("Doesn't allow you to register when in the Closed phase", async () => {
        try {
            await voting.moveToNextPhase();
            await voting.moveToNextPhase();
            await contractAsVoter.registerToVote();
            assert(false, "Should not be allowed to register when in Closed phase");
        } catch (error) {
            assert(error);
        }
    });

    it("Allows an address to vote optionA", async () => {
        await contractAsVoter.registerToVote();
        await voting.moveToNextPhase();
        await contractAsVoter.vote(true);

        const optionA = await contractAsVoter.optionA();
        const optionB = await contractAsVoter.optionB();

        expect(optionA.count).to.equal(1);
        expect(optionB.count).to.equal(0);
    });

    it("Allows an address to vote optionB", async () => {
        await contractAsVoter.registerToVote();
        await voting.moveToNextPhase();
        await contractAsVoter.vote(false);

        const optionA = await contractAsVoter.optionA();
        const optionB = await contractAsVoter.optionB();

        expect(optionA.count).to.equal(0);
        expect(optionB.count).to.equal(1);
    });

    it("Doesn't allow you to vote if you're not registered", async () => {
        await voting.moveToNextPhase();

        try {
            await contractAsVoter.vote(true);
            assert(false, "Should not have been allowed to vote when not registered");
        } catch (error) {
            assert(error);
        }
    });

    it("Doesn't allow you to vote twice", async () => {
        await contractAsVoter.registerToVote();
        await voting.moveToNextPhase();

        try {
            await contractAsVoter.vote(true);
            await contractAsVoter.vote(true);
            assert(false, "Should not have been allowed to vote twice");
        } catch (error) {
            assert(error);
        }
    });

    it("Doesn't allow you to vote when in Registration phase", async () => {
        await contractAsVoter.registerToVote();

        try {
            await contractAsVoter.vote(false);
            assert(false, "Should not have been allowed to vote in Registration phase");
        } catch (error) {
            assert(error);
        }
    });

    it("Doesn't allow you to vote when in Closed phase", async () => {
        await contractAsVoter.registerToVote();
        await voting.moveToNextPhase();
        await voting.moveToNextPhase();

        try {
            await contractAsVoter.vote(false);
            assert(false, "Should not have been allowed to vote in Closed phase");
        } catch (error) {
            assert(error);
        }
    });
});
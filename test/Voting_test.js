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
    contractAsVoter;

beforeEach(async () => {
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
            assert(false);
        }

        // Try with non-manager moving to next phase
        try {
            await contractAsVoter.moveToNextPhase();
            assert(false);
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
            assert(false);
        } catch (error) {
            assert(error);
        }
    });
});

describe("Voter functions", () => {
    it("Allows an address to register to vote", async () => {
        await contractAsVoter.registerToVote();
        expect(await voting.registeredVoters(voter.address)).to.equal(true);
    });
});
const { expect, assert } = require("chai");
const compiledVotingContract = require("../artifacts/contracts/Voting.sol/Voting.json");

let manager, votingFactory;
beforeEach(async () => {
    const VotingFactory = await ethers.getContractFactory("VotingFactory");
    const accounts = await ethers.getSigners();

    votingFactory = await VotingFactory.deploy();
    manager = accounts[0];

    await votingFactory.deployed();
});

describe("VotingFactory functionality", () => {
    it("Creates a Voting contract", async () => {
        await votingFactory.createVotingContract(
            manager.address,
            "Chocolate or Vanilla?",
            "Chocolate",
            "Vanilla",
            1000,
            1000
        );

        const votingAddresses = await votingFactory.getVotingContracts();

        assert(votingAddresses[0]);
    });

    it("Initializes a Voting contract correctly", async () => {
        const provider = ethers.getDefaultProvider();

        await votingFactory.createVotingContract(
            manager.address,
            "Chocolate or Vanilla?",
            "Chocolate",
            "Vanilla",
            1000,
            1000
        );

        const votingAddresses = await votingFactory.getVotingContracts();
        const votingContract = new ethers.Contract(
            votingAddresses[0],
            compiledVotingContract.abi,
            manager
        );

        assert(votingContract);

        const optionA = await votingContract.optionA();
        const optionB = await votingContract.optionB();

        expect(optionA.description).to.equal("Chocolate");
        expect(optionA.count).to.equal(0);

        expect(optionB.description).to.equal("Vanilla");
        expect(optionB.count).to.equal(0);

        expect(await votingContract.intendedVotingDate()).to.equal(1000);
        expect(await votingContract.actualVotingDate()).to.equal(0);

        expect(await votingContract.intendedClosingDate()).to.equal(1000);
        expect(await votingContract.actualClosingDate()).to.equal(0);

        expect(await votingContract.getVotingPhase()).to.equal("Registration");
        expect(await votingContract.manager()).to.equal(manager.address);
    });
});
const { expect, assert } = require("chai");

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
});
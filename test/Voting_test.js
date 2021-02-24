const { expect } = require("chai");

let accounts,
    account,
    description,
    optionADescription,
    optionBDescription,
    intendedVotingDate,
    intendedClosingDate,
    Voting,
    voting;

beforeEach(async () => {
    accounts = await ethers.getSigners();
    account = accounts[0].address;

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
});

describe("Voting functionality", () => {
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
        expect(await voting.manager()).to.equal(account);
    });

    it("Sets the next phase", async () => {
        expect(await voting.getVotingPhase()).to.equal("Registration");

        await voting.moveToNextPhase();
        expect(await voting.getVotingPhase()).to.equal("Voting");

        await voting.moveToNextPhase();
        expect(await voting.getVotingPhase()).to.equal("Closed");
    });
});
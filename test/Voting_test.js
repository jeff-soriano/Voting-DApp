const { expect } = require("chai");

describe("Voting functionality", () => {
    it("Initializes the state variables correctly", async () => {
        const accounts = await ethers.getSigners();
        const account = accounts[0].address;

        const description = "Chocolate or vanilla?";
        const optionADescription = "Chocolate";
        const optionBDescription = "Vanilla";
        const intendedVotingDate = Math.floor(Date.now() / 1000 + 1000);
        const intendedClosingDate = Math.floor(Date.now() / 1000 + 100000);

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(
            description,
            optionADescription,
            optionBDescription,
            intendedVotingDate,
            intendedClosingDate);

        await voting.deployed();

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
});
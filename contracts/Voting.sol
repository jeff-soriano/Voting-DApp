// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;

/// @author Jeff Soriano
/// @title A voting contract that allows voters to choose between two options
contract Voting {
    struct Option {
        string description;
        uint256 count;
    }

    enum VotingPhase {Registration, Voting, Closed}

    Option public optionA;
    Option public optionB;
    VotingPhase public votingPhase;

    address public manager;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public voters;
    string public description;

    /// Constructor
    /// @param _description the description of the Voting contract that tells the voters what they're voting for
    /// @param optionADescription the description of optionA
    /// @param optionBDescription the description of optionB
    constructor(
        string memory _description,
        string memory optionADescription,
        string memory optionBDescription
    ) {
        description = _description;

        optionA.description = optionADescription;
        optionA.count = 0;

        optionB.description = optionBDescription;
        optionB.count = 0;

        votingPhase = VotingPhase.Registration;

        manager = msg.sender;
    }

    /// Modifier that restricts certain functions for the manager only
    modifier restrictedToManager() {
        require(
            msg.sender == manager,
            "This function is restricted to the manager"
        );
        _;
    }

    /// Return the string value of votingPhase
    function getVotingPhase() public view returns (string memory) {
        string memory _votingPhase;

        if (votingPhase == VotingPhase.Registration) {
            _votingPhase = "Registration";
        } else if (votingPhase == VotingPhase.Voting) {
            _votingPhase = "Voting";
        } else if (votingPhase == VotingPhase.Closed) {
            _votingPhase = "Closed";
        }

        return _votingPhase;
    }
}

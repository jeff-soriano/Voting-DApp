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
    uint256 public intendedVotingDate;
    uint256 public intendedClosingDate;
    uint256 public actualVotingDate;
    uint256 public actualClosingDate;

    /// Constructor
    /// @param _description the description of the Voting contract that tells the voters what they're voting for
    /// @param optionADescription the description of optionA
    /// @param optionBDescription the description of optionB
    /// @param _intendedVotingDate the intended date that the manager will move the contract to the Voting phase, in Unix time
    /// @param _intendedClosingDate the intended date that the manager will move the contract to the Closed phase, in Unix time
    /// @dev sets values of all state variables except 'registeredVoters' and 'voters'
    constructor(
        string memory _description,
        string memory optionADescription,
        string memory optionBDescription,
        uint256 _intendedVotingDate,
        uint256 _intendedClosingDate
    ) {
        description = _description;

        optionA.description = optionADescription;
        optionA.count = 0;
        optionB.description = optionBDescription;
        optionB.count = 0;

        intendedVotingDate = _intendedVotingDate;
        intendedClosingDate = _intendedClosingDate;
        actualVotingDate = 0;
        actualClosingDate = 0;

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

    /// Moves to the next phase of voting
    /// @dev sets the state variable 'votingPhase' to the next part
    function moveToNextPhase() public restrictedToManager {
        require(
            votingPhase != VotingPhase.Closed,
            "Voting phase is set to Closed. Cannot move to next phase."
        );

        if (votingPhase == VotingPhase.Registration) {
            votingPhase = VotingPhase.Voting;
        } else if (votingPhase == VotingPhase.Voting) {
            votingPhase = VotingPhase.Closed;
        }
    }

    /// Get the string value of the voting phase
    /// @dev returns the string value of the state variable 'votingPhase'
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

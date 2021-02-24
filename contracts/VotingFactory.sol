// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;

import "./Voting.sol";

/// @author Jeff Soriano
/// @title A factory that generates Voting contracts
contract VotingContract {
    address[] public votingContracts;

    function createVotingContract(
        address manager,
        string memory description,
        string memory optionADescription,
        string memory optionBDescription,
        uint256 intendedVotingDate,
        uint256 intendedClosingDate
    ) public {
        address votingAddress =
            address(
                new Voting(
                    manager,
                    description,
                    optionADescription,
                    optionBDescription,
                    intendedVotingDate,
                    intendedClosingDate
                )
            );

        votingContracts.push(votingAddress);
    }

    function getVotingContracts() public view returns (address[] memory) {
        return votingContracts;
    }
}

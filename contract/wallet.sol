// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DepositWithdraw {
    mapping(address => uint256) private balances;

    // Event for deposit and withdrawal tracking
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // Function to deposit MATIC (or any native token on Polygon)
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Function to withdraw only what the user deposited
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    // Function to check the balance of a user
    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    // ✅ New function to check the total balance of the contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
// 0xc948a7F7EbFB5B787133A1AC8D61e82650E1f573
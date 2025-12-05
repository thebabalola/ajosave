// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseSafeFlexible} from "../src/BaseSafeFactory.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract BaseSafeFlexibleTest is Test {
    BaseSafeFlexible public pool;
    BaseToken public token;
    address public treasury;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public {
        treasury = address(0x100);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        
        token = new BaseToken("Base Safe Token", "BST");
        
        address[] memory members = new address[](3);
        members[0] = user1;
        members[1] = user2;
        members[2] = user3;
        
        pool = new BaseSafeFlexible(
            address(token),
            members,
            10e18, // minimumDeposit
            50, // withdrawalFeeBps (0.5%)
            true, // yieldEnabled
            treasury,
            100 // treasuryFeeBps (1%)
        );
    }

    function test_Deployment() public {
        assertEq(address(pool.token()), address(token));
        assertEq(pool.treasury(), treasury);
        assertEq(pool.totalMembers(), 3);
        assertEq(pool.minimumDeposit(), 10e18);
        assertEq(pool.withdrawalFeeBps(), 50);
        assertEq(pool.treasuryFeeBps(), 100);
        assertTrue(pool.yieldEnabled());
        assertTrue(pool.active());
        assertEq(pool.totalBalance(), 0);
    }

    function test_DeploymentWithInvalidParams() public {
        address[] memory members = new address[](1);
        members[0] = user1;
        
        vm.expectRevert("need >=2 members");
        new BaseSafeFlexible(address(token), members, 10e18, 50, true, treasury, 100);
    }

    function test_Deposit() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        
        vm.expectEmit(true, false, false, false);
        emit BaseSafeFlexible.Deposited(user1, 100e18);
        
        pool.deposit(100e18);
        vm.stopPrank();
        
        assertEq(pool.balances(user1), 100e18);
        assertEq(pool.getBalance(user1), 100e18);
        assertEq(pool.totalBalance(), 100e18);
        assertEq(token.balanceOf(address(pool)), 100e18);
    }

    function test_DepositBelowMinimum() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        vm.expectRevert("below minimum");
        pool.deposit(5e18); // below 10e18 minimum
        vm.stopPrank();
    }

    function test_DepositMultiple() public {
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(address(pool), 200e18);
        pool.deposit(200e18);
        vm.stopPrank();
        
        assertEq(pool.balances(user1), 100e18);
        assertEq(pool.balances(user2), 200e18);
        assertEq(pool.totalBalance(), 300e18);
    }

    function test_Withdraw() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.stopPrank();
        
        uint256 balanceBefore = token.balanceOf(user1);
        uint256 treasuryBalanceBefore = token.balanceOf(treasury);
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, false);
        emit BaseSafeFlexible.Withdrawn(user1, 99.5e18, 0.5e18); // 100 - 0.5% = 99.5
        
        pool.withdraw(100e18);
        
        // User gets 99.5e18, treasury gets 0.5e18 fee
        assertEq(token.balanceOf(user1), balanceBefore + 99.5e18);
        assertEq(token.balanceOf(treasury), treasuryBalanceBefore + 0.5e18);
        assertEq(pool.balances(user1), 0);
        assertEq(pool.totalBalance(), 0);
    }

    function test_WithdrawPartial() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.stopPrank();
        
        vm.prank(user1);
        pool.withdraw(50e18);
        
        assertEq(pool.balances(user1), 50e18);
        assertEq(pool.totalBalance(), 50e18);
    }

    function test_WithdrawInsufficientBalance() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.expectRevert("insufficient balance");
        pool.withdraw(200e18);
        vm.stopPrank();
    }

    function test_WithdrawZeroAmount() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.expectRevert("amount 0");
        pool.withdraw(0);
        vm.stopPrank();
    }

    function test_DistributeYield() public {
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        token.mint(address(this), 1000e18); // owner
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit(100e18);
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(address(pool), 200e18);
        pool.deposit(200e18);
        vm.stopPrank();
        
        // Distribute 30e18 yield
        token.approve(address(pool), 30e18);
        token.transfer(address(pool), 30e18);
        
        vm.expectEmit(false, false, false, false);
        emit BaseSafeFlexible.YieldDistributed(30e18);
        
        pool.distributeYield(30e18);
        
        // user1 should get 10e18 (33.33% of 30e18)
        // user2 should get 20e18 (66.67% of 30e18)
        assertEq(pool.balances(user1), 110e18);
        assertEq(pool.balances(user2), 220e18);
        assertEq(pool.totalBalance(), 330e18);
    }

    function test_DistributeYieldNotEnabled() public {
        // Create pool with yield disabled
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        BaseSafeFlexible noYieldPool = new BaseSafeFlexible(
            address(token),
            members,
            10e18,
            50,
            false, // yieldEnabled = false
            treasury,
            100
        );
        
        vm.expectRevert("yield disabled");
        noYieldPool.distributeYield(10e18);
    }

    function test_IsMember() public {
        assertTrue(pool.isMember(user1));
        assertTrue(pool.isMember(user2));
        assertTrue(pool.isMember(user3));
        assertFalse(pool.isMember(address(0x999)));
    }
}


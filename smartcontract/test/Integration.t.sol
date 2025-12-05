// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseSafeFactory} from "../src/BaseSafeFactory.sol";
import {BaseSafeRotational} from "../src/BaseSafeFactory.sol";
import {BaseSafeTarget} from "../src/BaseSafeFactory.sol";
import {BaseSafeFlexible} from "../src/BaseSafeFactory.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract IntegrationTest is Test {
    BaseSafeFactory public factory;
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
        factory = new BaseSafeFactory(address(token), treasury);
    }

    function test_FactoryCreatesRotationalPool() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address poolAddress = factory.createRotational(
            members,
            100e18,
            7 days,
            100,
            50
        );
        
        BaseSafeRotational pool = BaseSafeRotational(poolAddress);
        assertEq(address(pool.token()), address(token));
        assertEq(pool.totalMembers(), 2);
        assertEq(pool.depositAmount(), 100e18);
    }

    function test_FactoryCreatesTargetPool() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address poolAddress = factory.createTarget(
            members,
            1000e18,
            block.timestamp + 30 days,
            100
        );
        
        BaseSafeTarget pool = BaseSafeTarget(poolAddress);
        assertEq(address(pool.token()), address(token));
        assertEq(pool.totalMembers(), 2);
        assertEq(pool.targetAmount(), 1000e18);
    }

    function test_FactoryCreatesFlexiblePool() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address poolAddress = factory.createFlexible(
            members,
            10e18,
            50,
            true,
            100
        );
        
        BaseSafeFlexible pool = BaseSafeFlexible(poolAddress);
        assertEq(address(pool.token()), address(token));
        assertEq(pool.totalMembers(), 2);
        assertEq(pool.minimumDeposit(), 10e18);
    }

    function test_EndToEndRotationalFlow() public {
        // Create pool via factory
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address poolAddress = factory.createRotational(
            members,
            100e18,
            1 days, // short duration for testing
            100,
            50
        );
        
        BaseSafeRotational pool = BaseSafeRotational(poolAddress);
        
        // Mint tokens and deposit
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        
        vm.startPrank(user1);
        token.approve(poolAddress, 100e18);
        pool.deposit();
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(poolAddress, 100e18);
        pool.deposit();
        vm.stopPrank();
        
        // Trigger payout
        vm.warp(block.timestamp + 1 days);
        pool.triggerPayout();
        
        // Verify user1 received payout
        assertGt(token.balanceOf(user1), 1000e18);
        assertEq(pool.currentRound(), 1);
    }

    function test_EndToEndTargetFlow() public {
        // Create pool via factory
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address poolAddress = factory.createTarget(
            members,
            1000e18,
            block.timestamp + 30 days,
            100
        );
        
        BaseSafeTarget pool = BaseSafeTarget(poolAddress);
        
        // Contribute to reach target
        token.mint(user1, 1000e18);
        vm.startPrank(user1);
        token.approve(poolAddress, 1000e18);
        pool.contribute(1000e18);
        vm.stopPrank();
        
        assertTrue(pool.completed());
        
        // Withdraw
        uint256 balanceBefore = token.balanceOf(user1);
        vm.prank(user1);
        pool.withdraw();
        assertGt(token.balanceOf(user1), balanceBefore);
    }

    function test_MultiplePoolsFromFactory() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address pool1 = factory.createRotational(members, 100e18, 7 days, 100, 50);
        
        vm.prank(user2);
        address pool2 = factory.createTarget(members, 1000e18, block.timestamp + 30 days, 100);
        
        vm.prank(user1);
        address pool3 = factory.createFlexible(members, 10e18, 50, true, 100);
        
        assertEq(factory.allRotational().length, 1);
        assertEq(factory.allTarget().length, 1);
        assertEq(factory.allFlexible().length, 1);
        assertTrue(pool1 != pool2);
        assertTrue(pool2 != pool3);
        assertTrue(pool1 != pool3);
    }
}


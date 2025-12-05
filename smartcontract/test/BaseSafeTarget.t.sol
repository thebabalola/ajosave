// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseSafeTarget} from "../src/BaseSafeFactory.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract BaseSafeTargetTest is Test {
    BaseSafeTarget public pool;
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
        
        pool = new BaseSafeTarget(
            address(token),
            members,
            1000e18, // targetAmount
            block.timestamp + 30 days, // deadline
            100, // treasuryFeeBps (1%)
            treasury
        );
    }

    function test_Deployment() public {
        assertEq(address(pool.token()), address(token));
        assertEq(pool.treasury(), treasury);
        assertEq(pool.totalMembers(), 3);
        assertEq(pool.targetAmount(), 1000e18);
        assertEq(pool.treasuryFeeBps(), 100);
        assertTrue(pool.active());
        assertFalse(pool.completed());
        assertEq(pool.totalContributed(), 0);
    }

    function test_DeploymentWithInvalidParams() public {
        address[] memory members = new address[](1);
        members[0] = user1;
        
        vm.expectRevert("need >=2 members");
        new BaseSafeTarget(address(token), members, 1000e18, block.timestamp + 30 days, 100, treasury);
    }

    function test_Contribute() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 500e18);
        
        vm.expectEmit(true, false, false, false);
        emit BaseSafeTarget.Contributed(user1, 500e18);
        
        pool.contribute(500e18);
        vm.stopPrank();
        
        assertEq(pool.contributions(user1), 500e18);
        assertEq(pool.totalContributed(), 500e18);
        assertEq(token.balanceOf(address(pool)), 500e18);
    }

    function test_ContributeMultiple() public {
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 400e18);
        pool.contribute(400e18);
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(address(pool), 600e18);
        pool.contribute(600e18);
        vm.stopPrank();
        
        assertEq(pool.contributions(user1), 400e18);
        assertEq(pool.contributions(user2), 600e18);
        assertEq(pool.totalContributed(), 1000e18);
        assertTrue(pool.completed());
    }

    function test_ContributeNotMember() public {
        address nonMember = address(0x999);
        token.mint(nonMember, 1000e18);
        
        vm.startPrank(nonMember);
        token.approve(address(pool), 500e18);
        vm.expectRevert("not member");
        pool.contribute(500e18);
        vm.stopPrank();
    }

    function test_ContributeAfterDeadline() public {
        vm.warp(block.timestamp + 31 days);
        
        token.mint(user1, 1000e18);
        vm.startPrank(user1);
        token.approve(address(pool), 500e18);
        vm.expectRevert("deadline passed");
        pool.contribute(500e18);
        vm.stopPrank();
    }

    function test_ContributeZeroAmount() public {
        token.mint(user1, 1000e18);
        vm.startPrank(user1);
        token.approve(address(pool), 500e18);
        vm.expectRevert("amount 0");
        pool.contribute(0);
        vm.stopPrank();
    }

    function test_TargetReached() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 1000e18);
        
        vm.expectEmit(false, false, false, false);
        emit BaseSafeTarget.TargetReached();
        
        pool.contribute(1000e18);
        vm.stopPrank();
        
        assertTrue(pool.completed());
        assertEq(pool.totalContributed(), 1000e18);
    }
}


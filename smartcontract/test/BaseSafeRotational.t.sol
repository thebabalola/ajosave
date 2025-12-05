// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseSafeRotational} from "../src/BaseSafeFactory.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract BaseSafeRotationalTest is Test {
    BaseSafeRotational public pool;
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
        
        pool = new BaseSafeRotational(
            address(token),
            members,
            100e18, // depositAmount
            7 days, // roundDuration
            100, // treasuryFeeBps (1%)
            50, // relayerFeeBps (0.5%)
            treasury
        );
    }

    function test_Deployment() public {
        assertEq(address(pool.token()), address(token));
        assertEq(pool.treasury(), treasury);
        assertEq(pool.totalMembers(), 3);
        assertEq(pool.depositAmount(), 100e18);
        assertEq(pool.roundDuration(), 7 days);
        assertEq(pool.treasuryFeeBps(), 100);
        assertEq(pool.relayerFeeBps(), 50);
        assertEq(pool.currentRound(), 0);
        assertTrue(pool.active());
    }

    function test_DeploymentWithInvalidParams() public {
        address[] memory members = new address[](1);
        members[0] = user1;
        
        vm.expectRevert("need >=2 members");
        new BaseSafeRotational(address(token), members, 100e18, 7 days, 100, 50, treasury);
    }

    function test_Deposit() public {
        token.mint(user1, 1000e18);
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        
        vm.expectEmit(true, false, false, false);
        emit BaseSafeRotational.Deposit(user1, 100e18);
        
        pool.deposit();
        vm.stopPrank();
        
        assertTrue(pool.hasDeposited(user1));
        assertEq(token.balanceOf(address(pool)), 100e18);
    }

    function test_DepositMultipleMembers() public {
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        assertTrue(pool.hasDeposited(user1));
        assertTrue(pool.hasDeposited(user2));
        assertEq(token.balanceOf(address(pool)), 200e18);
    }

    function test_DepositNotMember() public {
        address nonMember = address(0x999);
        token.mint(nonMember, 1000e18);
        
        vm.startPrank(nonMember);
        token.approve(address(pool), 100e18);
        vm.expectRevert("not member");
        pool.deposit();
        vm.stopPrank();
    }

    function test_DepositAlreadyDeposited() public {
        token.mint(user1, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 200e18);
        pool.deposit();
        vm.expectRevert("already deposited");
        pool.deposit();
        vm.stopPrank();
    }

    function test_TriggerPayout() public {
        // All members deposit
        token.mint(user1, 1000e18);
        token.mint(user2, 1000e18);
        token.mint(user3, 1000e18);
        
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        vm.startPrank(user2);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        vm.startPrank(user3);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        // Fast forward time
        vm.warp(block.timestamp + 7 days);
        
        uint256 balanceBefore = token.balanceOf(user1);
        uint256 treasuryBalanceBefore = token.balanceOf(treasury);
        
        vm.prank(address(0x999)); // relayer
        pool.triggerPayout();
        
        // user1 should receive payout (minus fees)
        // Total: 300e18, Treasury: 3e18 (1%), Relayer: 1.5e18 (0.5%), Payout: 295.5e18
        assertGt(token.balanceOf(user1), balanceBefore);
        assertGt(token.balanceOf(treasury), treasuryBalanceBefore);
        assertEq(pool.currentRound(), 1);
        assertFalse(pool.hasDeposited(user1));
        assertFalse(pool.hasDeposited(user2));
        assertFalse(pool.hasDeposited(user3));
    }

    function test_TriggerPayoutTooEarly() public {
        token.mint(user1, 1000e18);
        vm.startPrank(user1);
        token.approve(address(pool), 100e18);
        pool.deposit();
        vm.stopPrank();
        
        vm.expectRevert("too early");
        pool.triggerPayout();
    }

    function test_TriggerPayoutAfterAllRounds() public {
        // Complete all 3 rounds
        for (uint i = 0; i < 3; i++) {
            token.mint(user1, 1000e18);
            token.mint(user2, 1000e18);
            token.mint(user3, 1000e18);
            
            vm.startPrank(user1);
            token.approve(address(pool), 100e18);
            pool.deposit();
            vm.stopPrank();
            
            vm.startPrank(user2);
            token.approve(address(pool), 100e18);
            pool.deposit();
            vm.stopPrank();
            
            vm.startPrank(user3);
            token.approve(address(pool), 100e18);
            pool.deposit();
            vm.stopPrank();
            
            vm.warp(block.timestamp + 7 days);
            pool.triggerPayout();
        }
        
        assertFalse(pool.active());
        assertEq(pool.currentRound(), 3);
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseSafeFactory} from "../src/BaseSafeFactory.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract BaseSafeFactoryTest is Test {
    BaseSafeFactory public factory;
    BaseToken public token;
    address public treasury;
    address public user1;
    address public user2;

    function setUp() public {
        treasury = address(0x100);
        user1 = address(0x1);
        user2 = address(0x2);
        
        token = new BaseToken("Base Safe Token", "BST");
        factory = new BaseSafeFactory(address(token), treasury);
    }

    function test_Deployment() public {
        assertEq(factory.token(), address(token));
        assertEq(factory.treasury(), treasury);
        assertEq(factory.owner(), address(this));
        assertEq(factory.allRotational().length, 0);
        assertEq(factory.allTarget().length, 0);
        assertEq(factory.allFlexible().length, 0);
    }

    function test_DeploymentWithZeroToken() public {
        vm.expectRevert("token 0");
        new BaseSafeFactory(address(0), treasury);
    }

    function test_DeploymentWithZeroTreasury() public {
        vm.expectRevert("treasury 0");
        new BaseSafeFactory(address(token), address(0));
    }

    function test_CreateRotational() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        uint256 depositAmount = 100e18;
        uint256 roundDuration = 7 days;
        uint256 treasuryFeeBps = 100; // 1%
        uint256 relayerFeeBps = 50; // 0.5%
        
        vm.expectEmit(true, true, false, false);
        emit BaseSafeFactory.RotationalCreated(address(0), user1);
        
        vm.prank(user1);
        address pool = factory.createRotational(
            members,
            depositAmount,
            roundDuration,
            treasuryFeeBps,
            relayerFeeBps
        );
        
        assertTrue(pool != address(0));
        assertEq(factory.allRotational().length, 1);
        assertEq(factory.allRotational()[0], pool);
    }

    function test_CreateRotationalMultiple() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address pool1 = factory.createRotational(members, 100e18, 7 days, 100, 50);
        
        vm.prank(user2);
        address pool2 = factory.createRotational(members, 200e18, 14 days, 100, 50);
        
        assertEq(factory.allRotational().length, 2);
        assertTrue(pool1 != pool2);
    }

    function test_CreateTarget() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        uint256 targetAmount = 1000e18;
        uint256 deadline = block.timestamp + 30 days;
        uint256 treasuryFeeBps = 100; // 1%
        
        vm.expectEmit(true, true, false, false);
        emit BaseSafeFactory.TargetCreated(address(0), user1);
        
        vm.prank(user1);
        address pool = factory.createTarget(members, targetAmount, deadline, treasuryFeeBps);
        
        assertTrue(pool != address(0));
        assertEq(factory.allTarget().length, 1);
        assertEq(factory.allTarget()[0], pool);
    }

    function test_CreateTargetMultiple() public {
        address[] memory members = new address[](2);
        members[0] = user1;
        members[1] = user2;
        
        vm.prank(user1);
        address pool1 = factory.createTarget(members, 1000e18, block.timestamp + 30 days, 100);
        
        vm.prank(user2);
        address pool2 = factory.createTarget(members, 2000e18, block.timestamp + 60 days, 100);
        
        assertEq(factory.allTarget().length, 2);
        assertTrue(pool1 != pool2);
    }
}


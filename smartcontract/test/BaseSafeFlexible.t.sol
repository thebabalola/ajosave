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
}


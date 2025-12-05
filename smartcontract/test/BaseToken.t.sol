// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BaseToken} from "../src/BaseToken.sol";

contract BaseTokenTest is Test {
    BaseToken public token;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        token = new BaseToken("Base Safe Token", "BST");
    }

    function test_Deployment() public {
        assertEq(token.name(), "Base Safe Token");
        assertEq(token.symbol(), "BST");
        assertEq(token.decimals(), 18);
        assertEq(token.owner(), owner);
        assertEq(token.totalSupply(), 0);
    }

    function test_Mint() public {
        uint256 amount = 1000e18;
        token.mint(user1, amount);
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_MintMultiple() public {
        token.mint(user1, 100e18);
        token.mint(user2, 200e18);
        
        assertEq(token.balanceOf(user1), 100e18);
        assertEq(token.balanceOf(user2), 200e18);
        assertEq(token.totalSupply(), 300e18);
    }

    function test_MintFuzz(uint256 amount) public {
        vm.assume(amount < type(uint256).max / 2);
        token.mint(user1, amount);
        assertEq(token.balanceOf(user1), amount);
    }
}


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
}


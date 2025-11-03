// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BaseToken} from "../src/BaseToken.sol";
import {BaseSafeFactory} from "../src/BaseSafeFactory.sol";

contract DeployAll is Script {
    // Treasury address provided by user (checksummed)
    address constant TREASURY = 0xa91D5A0a64ED5eeF11c4359C4631279695A338ef;
    
    // Token configuration - can be changed via environment variables
    string constant TOKEN_NAME = "Base Safe Token";
    string constant TOKEN_SYMBOL = "BST";

    function run() external returns (address tokenAddress, address factoryAddress) {
        vm.startBroadcast();

        // Deploy ERC20 Token
        console.log("Deploying BaseToken...");
        BaseToken token = new BaseToken(TOKEN_NAME, TOKEN_SYMBOL);
        tokenAddress = address(token);
        console.log("BaseToken deployed at:", tokenAddress);

        // Deploy Factory with the token and treasury
        console.log("Deploying BaseSafeFactory...");
        console.log("Using Treasury address:", TREASURY);
        BaseSafeFactory factory = new BaseSafeFactory(tokenAddress, TREASURY);
        factoryAddress = address(factory);
        console.log("BaseSafeFactory deployed at:", factoryAddress);

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Token Address:", tokenAddress);
        console.log("Factory Address:", factoryAddress);
        console.log("Treasury Address:", TREASURY);
        console.log("Token Name:", TOKEN_NAME);
        console.log("Token Symbol:", TOKEN_SYMBOL);

        return (tokenAddress, factoryAddress);
    }
}


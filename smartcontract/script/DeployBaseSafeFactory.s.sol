// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BaseSafeFactory} from "../src/BaseSafeFactory.sol";

contract DeployBaseSafeFactory is Script {
    function run() external returns (address) {
        // Get constructor parameters from environment variables or forge script args
        address token = vm.envAddress("TOKEN_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast();

        BaseSafeFactory factory = new BaseSafeFactory(token, treasury);

        vm.stopBroadcast();

        console.log("BaseSafeFactory deployed at:", address(factory));
        console.log("Token address:", token);
        console.log("Treasury address:", treasury);

        return address(factory);
    }
}


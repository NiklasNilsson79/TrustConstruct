// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "../lib/forge-std/src/Script.sol";

import "contracts/ReportRegistry.sol";


contract DeployReportRegistry is Script {
    function run() external returns (ReportRegistry reg) {
        address owner = vm.envOr("OWNER", msg.sender);

        vm.startBroadcast();
        reg = new ReportRegistry(owner);
        vm.stopBroadcast();
    }
}

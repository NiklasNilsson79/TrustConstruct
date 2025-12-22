// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../ReportRegistry.sol";

contract ReportRegistryTest is Test {
    ReportRegistry reg;

    address owner = address(0xA11CE);
    address attacker = address(0xB0B);

    bytes32 h1 = keccak256("report-hash-1");

    function setUp() public {
        vm.prank(owner);
        reg = new ReportRegistry(owner);
    }

    function test_register_and_verify() public {
        vm.prank(owner);
        reg.registerReport(h1);

        bool ok = reg.isRegistered(h1);
        assertTrue(ok);

        (address submitter, uint256 ts, bool exists) = reg.getRecord(h1);
        assertTrue(exists);
        assertEq(submitter, owner);
        assertGt(ts, 0);
    }

    function test_revert_on_zero_hash() public {
        vm.prank(owner);
        vm.expectRevert(ReportRegistry.ZeroHash.selector);
        reg.registerReport(bytes32(0));
    }

    function test_revert_on_duplicate() public {
        vm.prank(owner);
        reg.registerReport(h1);

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ReportRegistry.AlreadyRegistered.selector, h1));
        reg.registerReport(h1);
    }

    function test_only_owner_can_register() public {
        vm.prank(attacker);
        vm.expectRevert(ReportRegistry.NotOwner.selector);
        reg.registerReport(h1);
    }
}

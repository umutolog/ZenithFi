export const ZENITH_CORE_SOL = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZenithFi (ZENITH)
 * @notice Governance token with fixed 1 Billion supply.
 */
contract ZenithFi is ERC20, Ownable {
    constructor() ERC20("ZenithFi", "ZENITH") Ownable(msg.sender) {
        // Mint 1 Billion tokens to deployer
        _mint(msg.sender, 1_000_000_000 * 1e18);
    }
}

/**
 * @title ZenithVault (sZENITH)
 * @notice ERC4626 Yield Vault with Yield Simulation for testing.
 */
contract ZenithVault is ERC4626, Ownable {
    constructor(IERC20 _asset) ERC4626(_asset) ERC20("Staked Zenith", "sZENITH") Ownable(msg.sender) {}

    /**
     * @notice Simulates yield by injecting assets into the vault.
     * @dev Transfers tokens from admin to vault without minting shares.
     *      This increases the value of every existing share (exchange rate goes up).
     */
    function simulateYield(uint256 amount) external onlyOwner {
        // Requires admin to have approved the vault to spend tokens
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
    }
}
`;

export const HOPE_TOKEN_SOL = ZENITH_CORE_SOL; 
export const ZENITH_VAULT_SOL = ZENITH_CORE_SOL;
export const ZENITH_VAULT_TEST_SOL = `// Tests hidden`;
export const DEPLOY_SCRIPT_JS = `// Script hidden`;

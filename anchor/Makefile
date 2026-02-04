# Anchor Makefile
# Usage: make <command>

.PHONY: build test test-verbose deploy-devnet deploy-mainnet verify copy-idl clean install

# Default command
all: build

# Build the Anchor program
build:
	@echo "Building Anchor program..."
	anchor build

# Run tests
test:
	@echo "Running Anchor tests..."
	anchor test

# Run tests with verbose output
test-verbose:
	@echo "Running Anchor tests (verbose)..."
	anchor test -- --reporter spec

# Deploy to devnet
deploy-devnet:
	@echo "Deploying to devnet..."
	anchor deploy --provider.cluster devnet

# Deploy to mainnet
deploy-mainnet:
	@echo "Deploying to mainnet..."
	anchor deploy --provider.cluster mainnet

# Verify program on mainnet
verify:
	@echo "Verifying program on mainnet..."
	anchor verify --provider.cluster mainnet

# Generate and copy IDL to SDK
copy-idl:
	@echo "Copying IDL to SDK..."
	mkdir -p ../sdk/src/idl
	cp target/idl/evidence_vault.json ../sdk/src/idl/
	cp target/types/evidence_vault.ts ../sdk/src/idl/
	@echo "IDL copied successfully!"

# Build and copy IDL in one command
idl: build copy-idl

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	anchor clean
	rm -rf target/

# Install dependencies
install:
	@echo "Installing dependencies..."
	yarn install

# Full workflow: build, test, and copy IDL
ci: install build test copy-idl
	@echo "CI workflow complete!"

# Start local validator and run tests
local-test:
	@echo "Starting local validator and running tests..."
	anchor test --skip-local-validator

# Check program syntax without building
check:
	@echo "Checking program..."
	anchor check

# Get program IDL
get-idl:
	@echo "Extracting IDL..."
	anchor idl init --filepath target/idl/evidence_vault.json $(shell solana address -k target/deploy/evidence_vault-keypair.json)

# Update program ID in lib.rs and Anchor.toml (use with caution)
update-program-id:
	@echo "Current program ID:"
	@solana address -k target/deploy/evidence_vault-keypair.json
	@echo ""
	@echo "To update, run: make set-program-id ID=<new_id>"

set-program-id:
	@if [ -z "$(ID)" ]; then \
		echo "Error: ID not set. Use: make set-program-id ID=<new_id>"; \
		exit 1; \
	fi
	@echo "Updating program ID to $(ID)..."
	sed -i 's/declare_id!(".*")/declare_id!("$(ID)")/' programs/evidence_vault/src/lib.rs
	sed -i 's/evidence_vault = ".*"/evidence_vault = "$(ID)"/' Anchor.toml
	@echo "Program ID updated!"

# Show help
help:
	@echo "Available commands:"
	@echo "  make build          - Build the Anchor program"
	@echo "  make test           - Run Anchor tests"
	@echo "  make test-verbose   - Run tests with verbose output"
	@echo "  make deploy-devnet  - Deploy to devnet"
	@echo "  make deploy-mainnet - Deploy to mainnet"
	@echo "  make verify         - Verify program on mainnet"
	@echo "  make copy-idl       - Copy IDL to SDK directory"
	@echo "  make idl            - Build and copy IDL"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make install        - Install dependencies"
	@echo "  make ci             - Full CI workflow"
	@echo "  make local-test     - Run tests with local validator"
	@echo "  make check          - Check program syntax"
	@echo "  make update-program-id - Show current program ID"
	@echo "  make set-program-id ID=<id> - Update program ID"

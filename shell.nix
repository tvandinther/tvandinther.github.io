{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    git
    yarn
    nodejs_20
  ];

  shellHook = ''
    export PATH=$(pwd)/scripts:$PATH
  '';
}

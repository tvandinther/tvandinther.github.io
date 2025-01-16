{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    git
    yarn-berry
    nodejs_20
    libwebp
  ];

  shellHook = ''
    export PATH=$(pwd)/scripts:$PATH
  '';
}

---
title: .NET Libsql Client
description: A .NET client library for the libsql database server.
date: 2023-03-11T12:00:00+2:00
banner: 
  url: /assets/images/projects/libsql-client-dotnet_banner.webp
  alt: Turso logo
  anchor: left
sourceCodeUrl: https://github.com/tvandinther/libsql-client-dotnet
featured: true
---
Libsql is a fork of SQLite which enables SQLite to be used remotely using a client-server model. It is maintained by the team at [Turso](https://turso.tech/) and is used to power their database-as-a-service offering. When I started this project in September 2023, the only well supported client libraries available were for Rust and Javascript. I decided to take on the challenge to start a community project creating the first .NET client library for libsql.

*The project is currently under active development and is still in a pre-release state.*

### FFI

Through foreign function invocation (FFI), the .NET client library utilises the Rust [libsql crate](https://docs.rs/libsql/latest/libsql/index.html) through the officially maintained C-compatible bindings. C# P/Invoke bindings are generated using the [csbindgen](https://github.com/Cysharp/csbindgen) crate and wrapped into a managed .NET runtime.

### .NET Standard 2.0

The client library is built as a .NET Standard 2.0 library, which means it can be used in any .NET application that supports .NET Standard 2.0 or higher. This includes .NET Framework 4.6.1 and higher, .NET Core 2.0 and higher, and .NET 5.0 and higher. This was chosen to ensure that the library can be used in as many applications as possible while balancing access to modern .NET features.

### Roadmap

The client library is not yet fully functional and requires additional official C bindings to be made available in the libsql crate. Crucially, the next features to be implemented are:

- [ ] Remote database connections
- [ ] Access to the number of rows affected by a query
- [ ] Access to the last inserted row ID
- [ ] Paramterised queries

### Contributing

If you'd like to contribute to the project, please contact me on Discord **[@cashewblue](https://discordapp.com/users/cashewblue)**. In the meantime, see you at the Turso Discord channel **[#libsql-dotnet](https://discord.gg/jtNExZaFTP)**!

---
title: Fallible
description: An idiomatic and monadic way to explicitly define, propagate and handle error states in C#.
date: 2022-04-05T12:00:00+12:00
banner: 
  url: /assets/images/projects/fallible_banner.webp
  alt: Fallible banner
sourceCodeUrl: https://github.com/tvandinther/filedo
---
An idiomatic way to explicitly define, propagate and handle error states in C#.

The purpose of this library is to support the usage of a new pattern of error propagation in C#. Instead of throwing exceptions and implicitly requiring callers to catch them, the pattern used in this library explicitly defines possibilities of error states in the return type and expects them to the caller to consciously address it.

The benefit of this approach is that it enforces a higher level of care in the code that consumes services and methods which can introduce error state into an application. Errors can either be handled by the caller or be passed up the stack explicitly.

### Without Fallible
```c#
public int GetValue(int arg)
{
    if (arg == 42) throw new Exception("Can't work with 42");
    
    return arg + 3;
}
```
The caller must know to handle the error state.
```c#
try
{
    var result = GetValue(42);
}
catch (Exception ex)
{
    // Handle error
}
// continue with result
```
### With Fallible

```csharp
public Fallible<int> GetValue(int arg)
{
    if (arg == 42) return new Error("Can't work with 42");
    
    return arg + 3;
}
```
The caller is forced to acknowledge the error state.
```csharp
var (result, error) = GetValue(42);
if (error)
{
    // Handle error
}
// continue with result
```

# WeRemember

WeRemember is a local password-manager style web app built with ASP.NET Core Razor Pages. It also includes a Chrome extension that talks to the local web app through API endpoints.

The project is meant to run on your own desktop during development. You clone it from GitHub, set up the local database, run the ASP.NET Core app, and then load the browser extension in Chrome.

The GitHub repository and main folder can still be named `ManPass1`. That is only the repo/folder name. The application itself is named `WeRemember`.

## What You Need

Install these before running the project on another desktop:

- Git
  - Used to download the project from GitHub.
- .NET SDK 10 or the SDK version that matches the project target
  - The project currently targets `net10.0`.
- SQL Server LocalDB
  - Used as the local database for development.
  - This usually comes with Visual Studio or SQL Server Express LocalDB.
- Google Chrome
  - Needed if you want to run the included Chrome extension.

Optional but helpful:

- Visual Studio 2026 or newer
  - Good for opening, editing, and running the ASP.NET Core project.
- SQL Server Management Studio
  - Helpful if you want to inspect the local database manually.

## Download The Project

Open PowerShell on the new desktop and run:

```powershell
git clone https://github.com/Khushi-216/ManPass1.git
cd ManPass1
```

This downloads the project from GitHub and moves you into the project folder.

## Restore The Project Packages

Run:

```powershell
dotnet restore .\ManPass1.slnx
```

This downloads the NuGet packages the app needs, such as Entity Framework Core, SQL Server support, JWT authentication, and BCrypt.

## Trust The Local HTTPS Certificate

Run:

```powershell
dotnet dev-certs https --trust
```

The app runs locally over HTTPS at `https://localhost:7189`. This command tells your desktop to trust the development HTTPS certificate so the browser does not block the local site.

## Set Up The Database

The app uses SQL Server LocalDB with this development connection string:

```text
Server=(localdb)\MSSQLLocalDB;Database=ManPass1Db;Trusted_Connection=True;TrustServerCertificate=True;
```

The database structure is already described in the `Migrations` folder. To create or update the database, install the Entity Framework tool if you do not already have it:

```powershell
dotnet tool install --global dotnet-ef
```

Then run:

```powershell
dotnet ef database update --project .\ManPass1\ManPass1.csproj
```

This creates the `ManPass1Db` database in LocalDB and applies the migrations.

## Run The Web App

Run:

```powershell
dotnet run --project .\ManPass1\ManPass1.csproj --launch-profile https
```

Then open:

```text
https://localhost:7189
```

The app also has an HTTP profile at `http://localhost:5294`, but the browser extension is configured to use the HTTPS address.

## Load The Chrome Extension

First, keep the web app running.

Then in Chrome:

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select this folder from the cloned project:

```text
ManPass1\ManPass1Extention
```

The extension is branded as WeRemember and uses this local backend URL:

```text
https://localhost:7189
```

So the ASP.NET Core app must be running with the `https` launch profile for the extension to work.

## Common Problems

### `dotnet` is not recognized

The .NET SDK is not installed, or it is not available in your PATH. Install the .NET SDK and reopen PowerShell.

### LocalDB connection error

SQL Server LocalDB may not be installed. Install Visual Studio with SQL Server LocalDB support, or install SQL Server Express LocalDB separately.

### `dotnet ef` is not recognized

Install the Entity Framework CLI tool:

```powershell
dotnet tool install --global dotnet-ef
```

If it is already installed, update it:

```powershell
dotnet tool update --global dotnet-ef
```

### Browser says the HTTPS certificate is not trusted

Run:

```powershell
dotnet dev-certs https --trust
```

Then close and reopen the browser.

### Chrome extension cannot connect to the app

Check these things:

- The web app is running.
- You opened the app at `https://localhost:7189`.
- The extension was loaded from `ManPass1\ManPass1Extention`.
- The browser accepted the local HTTPS certificate.

## Updating The Project Later

When changes are pushed to GitHub, go to the project folder on the other desktop and run:

```powershell
git pull
dotnet restore .\ManPass1.slnx
dotnet ef database update --project .\ManPass1\ManPass1.csproj
```

Then run the app again:

```powershell
dotnet run --project .\ManPass1\ManPass1.csproj --launch-profile https
```

## Project Structure

```text
ManPass1.slnx
ManPass1/                   ASP.NET Core app source folder
  Controllers/              API controllers for authentication and vault data
  Data/                     Entity Framework database context
  Migrations/               Database migration files
  Models/                   App data models
  Pages/                    Razor Pages UI
  Services/                 App services, including password encryption
  ManPass1Extention/        Chrome extension files
  appsettings.Development.json
  Program.cs
```

The source folder and extension folder still use the older `ManPass1` folder names so the repository structure stays stable. Inside the app, the visible product name is `WeRemember`.

The local database name and encryption purpose also keep the older internal `ManPass1` name so existing development vault data can still be read after the rename.

## Notes

This setup is for local development. Before using this as a real production password manager, the app would need a stronger production security review, secret management, deployment configuration, and database hardening.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Blackstone_Interior.csproj", "./"]
RUN dotnet restore "Blackstone_Interior.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Blackstone_Interior.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Blackstone_Interior.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Blackstone_Interior.dll"]

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Mona_Interior.csproj", "./"]
RUN dotnet restore "Mona_Interior.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Mona_Interior.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Mona_Interior.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Mona_Interior.dll"]

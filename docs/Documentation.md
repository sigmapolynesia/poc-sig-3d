# Documentation POC MapLibre GL JS

Cette documentation vise à présenter les POC réalisés avec MapLibre GL JS pour la visualisation 3D de données géospatiales. 

## Table des matières

1. [Introduction](#introduction)
2. [WMTS (Web Map Tile Service)](#wmts)
3. [GeoJSON](#geojson)
4. [MVT (Mapbox Vector Tiles)](#mvt)
5. [LiDAR](#lidar)
6. [3D Tiles](#3d-tiles)
7. [Relief/DEM](#relief-dem)
8. [Synthèse comparative](#synthèse-comparative)

## Introduction

### Données géospatiales 
Les données géospatiales utilisées sont : tuiles vectorielles 3D, nuages de points LiDAR, modèles 3D, données d'élévation, format d'encodage de données géospatiales et standards OGC.

### Méthodologie
Les points incluent les dépendances, les formats d'entrée et de sortie, le type de stockage, les limitations, le qualité de support de MapLibre, les coûts et la gestion serveur/cloud.

## WMTS

### Dépendances
- API TeFenua - Flux WMTS (Standard OGC)

### Formats d'entrée/sortie
- **Entrée** : GetCapabilities: XML - tuiles: PNG/PNG8
- **Sortie** : Rendu tuiles raster en PNG/PNG8

### Type de stockage
- Tuiles stockées côté serveur WMTS
- Cache navigateur pour les tuiles téléchargées

### Limitations
- Dépendance de la disponibilité du service
- Mise en place de la lecture du GetCapabilities nécessaire (non natif dans MapLibre)

### Support MapLibre
- **Support natif** : Oui, via `raster` source type

### Coût
- Gratuit côté client
- Coût serveur selon le service WMTS utilisé

### Gestion serveur/cloud
- Lib Node.js: TileServer-GL partiellement (non-recommandé)
- Autres (Local) : 
  - GeoServer (Java) et GeoWebCache 
  - MapServer (C++) 
  - Tegola (Go)

## GeoJSON

### Dépendances
- Fichier GeoJSON: `test.geojson` sur le serveur local

### Formats d'entrée/sortie
- **Entrée** : GeoJSON (`.json`, `.geojson`)
- **Sortie** : Rendu vectoriel dans le navigateur en `.geojson`

### Type de stockage
- Fichiers statiques ou API REST (Express.js)
- Chargement en mémoire côté client
- Base de données spatiale (PostGIS)
- NoSQL (MongoDB)

### Limitations
- Taille limitée par la mémoire navigateur
- Pas d'optimisation pour très gros datasets
- Projection WGS84 recommandée

### Support MapLibre
- **Support natif** : Oui, via `geojson` source type

### Coût
- Gratuit

### Gestion serveur/cloud
- Pas de serveur spécifique requis
- Simple hébergement de fichiers statiques
- Serveur: GeoServer/MapServer et Tegola (via PostGIS)
- Cloud: GitHub Pages, Mapbox, MapTiler (Payants)

## MVT

### Dépendances
- GeoServer Sigma Polynesia

### Formats d'entrée/sortie
- **Entrée** : Dossier de tuiles vectorielles (.pbf)
- **Sortie** : Rendu vectoriel dans le navigateur en `.pbf`

### Type de stockage
- Base de données spatiale (PostGIS)
- Génération de tuiles à la volée ou pré-générées

### Limitations
- Nécessite un serveur capable de générer des MVT
- Projections limitées (généralement Web Mercator)
- Doit être contenue dans un `.mbtiles` pour un fichier unique

### Support MapLibre
- **Support natif** : Oui, via `vector` source type

### Coût
- Gratuit côté client
- Coût infrastructure serveur

### Autres outils
- Librairies Mapbox : 
  - Tilebelt - TypeScript (manipulation de tuiles)
  - Vector-tile - JavaScript (parsing)
  - Tippecanoe fork by Felt - C++ (génération de tuiles) 

- Autres :
  - Tilemaker - C++ (génération de tuiles à partir de données OSM)


### Gestion serveur/cloud
- Gratuits :
  - Tegola - Go (Serveur local basé sur PostGIS)
  - TileServer-GL - Node.js (Serveur local - créé et maintenu par MapTiler)

- Payants :
  - Mapbox (Service cloud)
  - MapTiler (Service Cloud)
  - Stadia Maps (Service Cloud)
  - Carto (Service Cloud)

## LiDAR

### Dépendances
- deck.gl 
- loaders.gl pour le parsing LAS/LAZ

### Formats d'entrée/sortie
- **Entrée** : Fichiers LAS/LAZ
- **Sortie** : Nuage de points rendu via WebGL

### Type de stockage
- Fichiers LAZ statiques
- Possible conversion en 3D Tiles pour optimisation

### Limitations
- Performances limitées pour de gros fichiers
- Pas de support natif MapLibre
- Nécessite deck.gl

### Support MapLibre
- **Support communautaire** : Via deck.gl (maintenu par Uber)

### Coût
- Gratuit

### Autres outils
- Librairies :
  - Potree Converter (conversion optimisée)

### Gestion serveur/cloud
- PotreeServer - Local (nécessite de convertir au format Potree)
- Autres ?

## 3D Tiles

### Dépendances
- deck.gl
- @loaders.gl/3d-tiles
- @mfbonfigli/gocesiumtiler pour la génération de 3d Tiles à partir de PointClouds
- py3dtiles pour la génération de 3d Tiles

### Formats d'entrée/sortie
- gocesiumtiler :
  - **Entrée** : `.las` ou `.laz`
  - **Sortie** : `.pnts` + `tileset.json`

- py3dtiles (encore en développement pour les géométries):
  - **Entrée** : pointclouds (`.las`, `.laz`, `.xyz`, `.csv`, `.ply`) ou geométries (`.wkb`, `.ifc`)
  - **Sortie** : (`.pnts` ou `.b3dm`) + `tileset.json` 

### Type de stockage
- Fichiers 3D Tiles hiérarchiques
- Structure arborescente pour LOD

### Limitations
- Pas de support natif MapLibre
- Nécessite deck.gl
- Complexité de génération des tilesets

### Support MapLibre
- **Support communautaire** : Via deck.gl (maintenu par Uber)

### Coût
- Gratuit côté rendu
- Coût de génération des tilesets (outils spécialisés) si non utilisation de gocesiumtiler ou py3dtiles

### Gestion serveur/cloud
- Cesium ion (payant/cloud)
- Cesium ion Self-Hosted (Serveur Local)

## 3D Models

### Dépendances
- threejs
- plugin QGIS: qgis2threejs

### Formats d'entrée/sortie
- **Entrée** : `.glb` ou `.gltf`
- **Sortie** : Modèle 3D rendu via threejs et WebGL

### Type de stockage
- Fichiers unique GLB ou GLTF

### Limitations
- Pas de support natif MapLibre
- Création complexe de GLB et GLTF
- Complexité de compréhension de threejs

### Support MapLibre
- **Support communautaire** : Via threejs mais exemples officiels de MapLibre

### Coût
- Gratuit côté création
- Gratuit côté rendu

### Gestion serveur/cloud
- GitHub Pages (cloud)
- Cesium ion (cloud)

## Relief/DEM

### Dépendances
- rio-rgbify + `pmtiles convert`
- rgb-weaver (rio-rgbify + mbutil + gdal)
- encodage mapbox (recommandé)

### Formats d'entrée/sortie
- rio-rgbify + `pmtiles convert`:
  - **Entrée** : `.tif` ou `.tiff`
  - **Intermédiaire** : `.mbtiles`
  - **Sortie** : `.pmtiles`

- rgb-weaver :
  - **Entrée** : `.tif` ou `.tiff`
  - **Sortie** : (`.png` ou `.webp`) + `tiles.json`

### Type de stockage
- Tuiles raster d'élévation
- Fichier unique pour `.pmtiles`
- Dossier pour rgb-weaver

### Limitations
- Pas de grosses limitations hormis le manque de données

### Support MapLibre
- **Support natif** : Oui, via `raster-dem` et `setTerrain()`

### Coût
- Gratuit

### Gestion serveur/cloud
- Cloud:
  - MapTiler
  - Protomaps hosted

- Local:
  - TileServer-GL by MapTiler - Node.js
  - Martin by MapLibre - Rust
  - t-rex - Rust
@AGENTS.md

## Règles de recherche

- Ne JAMAIS grep/lire/lister dans node_modules, dist, build, .expo
- Pour les questions sur le comportement d'une lib tierce (ex: expo-router),
  demander confirmation avant d'aller fouiller dans node_modules

## Référence

Le projet web équivalent est dans ../web (lecture seule, ne jamais modifier).
Toute logique métier (validation, appels API, types) doit s'aligner sur ce qui existe là-bas.
Ne pas consulter l'api dans ../api, le web fait foi.

- Mon systeme de pagination se base surtout dans ApiResource, il faut etendre dès qu'il faut faire la pagination.

- [x] Locate message command handling for prefix commands.
- [x] Add `GuildConfig.Noprefix` schema fields.
- [x] Add owner-only command file `Commands/Prefix/OwnerOnly/noprefix.mjs` supporting `.noprefix add <user>` and `.noprefix remove <user>`.
- [x] Update `src/events/Message/messageCreate2.mjs` to execute prefix commands when a whitelisted user sends the command WITHOUT the configured prefix.
- [ ] (Optional) Add tests / run bot and validate runtime behavior.


"use strict";
var Character = [];

// Loads a character in the buffer
function CharacterReset(CharacterID, CharacterAssetFamily) {

	// Prepares the character sheet
	var NewCharacter = {
		ID: CharacterID,
		Name: "",
		AssetFamily: CharacterAssetFamily,
		AccountName: "",
		Owner: "",
		Lover: "",
		Tags: "",
		Description: "",
		Money: 0,
		Inventory: [],		
		Appearance: [],
		Stage: "0",
		CurrentDialog: "",
		Dialog: [],
		Reputation: [],
		Skill: [],
		Pose: [],
		Effect: [],
		FocusGroup: null,
		Canvas: null,
		CanvasBlink: null,
		MustDraw: false,
		BlinkFactor: Math.round(Math.random() * 10) + 10,
		AllowItem: true,
		HeightModifier: 0,
		CanTalk : function() { return ((this.Effect.indexOf("GagLight") < 0) && (this.Effect.indexOf("GagNormal") < 0) && (this.Effect.indexOf("GagHeavy") < 0) && (this.Effect.indexOf("GagTotal") < 0)) },
		CanWalk : function() { return ((this.Effect.indexOf("Freeze") < 0) && (this.Effect.indexOf("Tethered") < 0) && ((this.Pose == null) || (this.Pose.indexOf("Kneel") < 0) || (this.Effect.indexOf("KneelFreeze") < 0))) },
		CanKneel : function() { return ((this.Effect.indexOf("Freeze") < 0) && (this.Effect.indexOf("ForceKneel") < 0) && ((this.Pose == null) || (this.Pose.indexOf("LegsClosed") < 0))) },
		CanInteract : function() { return (this.Effect.indexOf("Block") < 0) },
		CanChange : function() { return ((this.Effect.indexOf("Freeze") < 0) && (this.Effect.indexOf("Block") < 0) && (this.Effect.indexOf("Prone") < 0) && !LogQuery("BlockChange", "Rule") && (!LogQuery("BlockChange", "OwnerRule") || (Player.Ownership == null) || (Player.Ownership.Stage != 1))) },
		IsProne : function() { return (this.Effect.indexOf("Prone") >= 0) },
		IsRestrained : function() { return ((this.Effect.indexOf("Freeze") >= 0) || (this.Effect.indexOf("Block") >= 0) || (this.Effect.indexOf("Prone") >= 0)) },
		IsBlind : function() { return ((this.Effect.indexOf("BlindLight") >= 0) || (this.Effect.indexOf("BlindNormal") >= 0) || (this.Effect.indexOf("BlindHeavy") >= 0)) },
		IsEnclose :  function() { return (this.Effect.indexOf("Enclose") >= 0) },
		IsChaste : function() { return ((this.Effect.indexOf("Chaste") >= 0) || (this.Effect.indexOf("BreastChaste") >= 0)) },
		IsVulvaChaste : function() { return (this.Effect.indexOf("Chaste") >= 0) },
		IsBreastChaste : function() { return (this.Effect.indexOf("BreastChaste") >= 0) },
		IsEgged : function() { return (this.Effect.indexOf("Egged") >= 0) },
		IsOwned : function() { return ((this.Owner != null) && (this.Owner.trim() != "")) },
		IsOwnedByPlayer : function() { return (((((this.Owner != null) && (this.Owner.trim() == Player.Name)) || (NPCEventGet(this, "EndDomTrial") > 0)) && (this.Ownership == null)) || ((this.Ownership != null) && (this.Ownership.MemberNumber != null) && (this.Ownership.MemberNumber == Player.MemberNumber))) },
		IsOwner : function() { return ((NPCEventGet(this, "EndSubTrial") > 0) || (this.Name == Player.Owner.replace("NPC-", ""))) },
		IsKneeling: function () { return ((this.Pose != null) && (this.Pose.indexOf("Kneel") >= 0)) },
		IsNaked : function () { return CharacterIsNaked(this); },
		IsDeaf : function() { return ((this.Effect.indexOf("DeafLight") >= 0) || (this.Effect.indexOf("DeafNormal") >= 0) || (this.Effect.indexOf("DeafHeavy") >= 0)) },
		HasNoItem : function () { return CharacterHasNoItem(this); }
	}

	// If the character doesn't exist, we create it
	if (CharacterID >= Character.length)
		Character.push(NewCharacter);
	else
		Character[CharacterID] = NewCharacter;

	// Creates the inventory and default appearance
	if (CharacterID == 0) {
		Player = NewCharacter;
		CharacterAppearanceSetDefault(NewCharacter);
	}
		
	// Load the character image
	CharacterLoadCanvas(NewCharacter);

}

// Creates a random name for the character
function CharacterRandomName(C) {

	// Generates a name from the name bank 
	var NewName = CharacterName[Math.floor(Math.random() * CharacterName.length)];
	C.Name = NewName;
	
	// If the name is already taken, we generate a new one
	for (var CN = 0; CN < Character.length; CN++)
		if ((Character[CN].Name == NewName) && (Character[CN].ID != C.ID)) {
			CharacterRandomName(C);
			return;
		}

	// If the name is already taken by a private room character
	for (var P = 0; P < PrivateCharacter.length; P++)
		if ((PrivateCharacter[P].Name == NewName) && ((PrivateCharacter[P].ID == null) || (PrivateCharacter[P].ID != C.ID))) {
			CharacterRandomName(C);
			return;
		}

}

// Builds the dialog objects from the CSV files
function CharacterBuildDialog(C, CSV) {

	// For each lines in the file
	C.Dialog = [];
	for (var L = 0; L < CSV.length; L++)
		if ((CSV[L][0] != null) && (CSV[L][0] != "")) {

			// Creates a dialog object
			var D = {};
			D.Stage = CSV[L][0];
			if ((CSV[L][1] != null) && (CSV[L][1].trim() != "")) D.NextStage = CSV[L][1];
			if ((CSV[L][2] != null) && (CSV[L][2].trim() != "")) D.Option = CSV[L][2].replace("DialogCharacterName", C.Name).replace("DialogPlayerName", Player.Name);
			if ((CSV[L][3] != null) && (CSV[L][3].trim() != "")) D.Result = CSV[L][3].replace("DialogCharacterName", C.Name).replace("DialogPlayerName", Player.Name);
			if ((CSV[L][4] != null) && (CSV[L][4].trim() != "")) D.Function = ((CSV[L][4].trim().substring(0, 6) == "Dialog") ? "" : CurrentScreen) + CSV[L][4];
			if ((CSV[L][5] != null) && (CSV[L][5].trim() != "")) D.Prerequisite = CSV[L][5];
			if ((CSV[L][6] != null) && (CSV[L][6].trim() != "")) D.Group = CSV[L][6];
			if ((CSV[L][7] != null) && (CSV[L][7].trim() != "")) D.Trait = CSV[L][7];
			C.Dialog.push(D);

		}
		
	// Translate the dialog if needed
	TranslationDialog(C);

}

// Loads a CSV file to build the character dialog
function CharacterLoadCSVDialog(C, Override) {

    // Finds the full path of the CSV file to use cache
    var FullPath = ((C.ID == 0) ? "Screens/Character/Player/Dialog_Player" : ((Override == null) ? "Screens/" + CurrentModule + "/" + CurrentScreen + "/Dialog_" + C.AccountName : Override)) + ".csv";
    if (CommonCSVCache[FullPath]) {
		CharacterBuildDialog(C, CommonCSVCache[FullPath]);
        return;
    }
    
    // Opens the file, parse it and returns the result it to build the dialog
    CommonGet(FullPath, function() {
        if (this.status == 200) {
            CommonCSVCache[FullPath] = CommonParseCSV(this.responseText);
			CharacterBuildDialog(C, CommonCSVCache[FullPath]);
        }
    });
	
}

// Sets the clothes based on a character archetype
function CharacterArchetypeClothes(C, Archetype, ForceColor) {
	
	// Maid archetype
	if (Archetype == "Maid") {
		InventoryAdd(C, "MaidOutfit1", "Cloth", false);
		CharacterAppearanceSetItem(C, "Cloth", C.Inventory[C.Inventory.length - 1].Asset);
		CharacterAppearanceSetColorForGroup(C, "Default", "Cloth");
		InventoryAdd(C, "MaidHairband1", "Hat", false);
		CharacterAppearanceSetItem(C, "Hat", C.Inventory[C.Inventory.length - 1].Asset);
		CharacterAppearanceSetColorForGroup(C, "Default", "Hat");
		InventoryAdd(C, "MaidOutfit2", "Cloth", false);
		InventoryRemove(C, "HairAccessory");
		C.AllowItem = (LogQuery("LeadSorority", "Maid"));
	}

	// Mistress archetype
	if (Archetype == "Mistress") {
		var ColorList = ["#333333", "#AA4444", "#AAAAAA"];
		var Color = (ForceColor == null) ? CommonRandomItemFromList("", ColorList) : ForceColor;
		CharacterAppearanceSetItem(C, "Hat", null);
		InventoryAdd(C, "MistressGloves", "Gloves", false);
		InventoryWear(C, "MistressGloves", "Gloves", Color);
		InventoryAdd(C, "MistressBoots", "Shoes", false);
		InventoryWear(C, "MistressBoots", "Shoes", Color);
		InventoryAdd(C, "MistressTop", "Cloth", false);
		InventoryWear(C, "MistressTop", "Cloth", Color);
		InventoryAdd(C, "MistressBottom", "ClothLower", false);
		InventoryWear(C, "MistressBottom", "ClothLower", Color);
		InventoryAdd(C, "MistressPadlock", "ItemMisc", false);
		InventoryAdd(C, "MistressPadlockKey", "ItemMisc", false);
		InventoryRemove(C, "HairAccessory");
	}

}

// Loads in the NPC character in the buffer
function CharacterLoadNPC(NPCType) {

	// Checks if the NPC already exists and returns it if it's the case
	for (var C = 0; C < Character.length; C++)
		if (Character[C].AccountName == NPCType)
			return Character[C];

	// Randomize the new character
	CharacterReset(Character.length, "Female3DCG");
	C = Character[Character.length - 1];
	C.AccountName = NPCType;
	CharacterLoadCSVDialog(C);
	CharacterRandomName(C);
	CharacterAppearanceBuildAssets(C);
	CharacterAppearanceFullRandom(C);

	// Sets archetype clothes
	if (NPCType.indexOf("Maid") >= 0) CharacterArchetypeClothes(C, "Maid");
	if (NPCType.indexOf("Mistress") >= 0) CharacterArchetypeClothes(C, "Mistress");

	// Returns the new character
	return C;

}

// Sets up the online character
function CharacterOnlineRefresh(Char, data, SourceMemberNumber) {
	Char.ActivePose = data.ActivePose;
	Char.LabelColor = data.LabelColor;
	Char.Creation = data.Creation;
	Char.ItemPermission = data.ItemPermission;
	Char.Ownership = data.Ownership;	
	Char.Tags = data.Tags;	
	Char.Description = data.Description;	
	Char.Reputation = (data.Reputation != null) ? data.Reputation : [];
	Char.Appearance = ServerAppearanceLoadFromBundle(Char, "Female3DCG", data.Appearance, SourceMemberNumber);
	if (Char.ID != 0) InventoryLoad(Char, data.Inventory);
	AssetReload(Char);
	CharacterLoadEffect(Char);
	CharacterRefresh(Char);
}

// Loads an online character
function CharacterLoadOnline(data, SourceMemberNumber) {

	// Checks if the NPC already exists and returns it if it's the case
	var Char = null;	
	if (data.ID.toString() == Player.OnlineID)
		Char = Player;
	else
		for (var C = 0; C < Character.length; C++)
			if (Character[C].AccountName == "Online-" + data.ID.toString())
				Char = Character[C];

	// If the character isn't found
	if (Char == null) {
		
		// Creates the new character from the online template
		CharacterReset(Character.length, "Female3DCG");
		Char = Character[Character.length - 1];
		Char.Name = data.Name;
		Char.Lover = (data.Lover != null) ? data.Lover : "";
		Char.Owner = (data.Owner != null) ? data.Owner : "";				
		Char.Tags = (data.Tags != null) ? data.Tags : "";
		Char.Description = (data.Description != null) ? data.Description : "";
		Char.AccountName = "Online-" + data.ID.toString();
		Char.MemberNumber = data.MemberNumber;
		var BackupCurrentScreen = CurrentScreen;
		CurrentScreen = "ChatRoom";
		CharacterLoadCSVDialog(Char, "Screens/Online/ChatRoom/Dialog_Online");
		CharacterOnlineRefresh(Char, data, SourceMemberNumber);
		CurrentScreen = BackupCurrentScreen;

	} else {
		
		// If we must add a character, we refresh it
		var Refresh = true;
		if (ChatRoomData.Character != null)
			for (var C = 0; C < ChatRoomData.Character.length; C++)
				if (ChatRoomData.Character[C].ID.toString() == data.ID.toString()) {
					Refresh = false;
					break;
				}
			
		// Flags "refresh" if we need to redraw the character
		if (!Refresh)
			if ((Char.ActivePose != data.ActivePose) || (Char.LabelColor != data.LabelColor) || (ChatRoomData == null) || (ChatRoomData.Character == null))
				Refresh = true;
			else
				for (var C = 0; C < ChatRoomData.Character.length; C++)
					if (ChatRoomData.Character[C].ID == data.ID)
						if (ChatRoomData.Character[C].Appearance.length != data.Appearance.length)
							Refresh = true;
						else
							for (var A = 0; A < data.Appearance.length && !Refresh; A++) {
								var Old = ChatRoomData.Character[C].Appearance[A];
								var New = data.Appearance[A];
								if ((New.Name != Old.Name) || (New.Group != Old.Group) || (New.Color != Old.Color)) Refresh = true;
								else if ((New.Property != null) && (Old.Property != null) && (JSON.stringify(New.Property) != JSON.stringify(Old.Property))) Refresh = true;
								else if (((New.Property != null) && (Old.Property == null)) || ((New.Property == null) && (Old.Property != null))) Refresh = true;
							}

		// Flags "refresh" if the ownership or inventory has changed
		if (!Refresh && (JSON.stringify(Char.Ownership) !== JSON.stringify(data.Ownership))) Refresh = true;
		if (!Refresh && (Char.Tags != data.Tags)) Refresh = true;
		if (!Refresh && (Char.Description != data.Description)) Refresh = true;
		if (!Refresh && (data.Inventory != null) && (Char.Inventory.length != data.Inventory.length)) Refresh = true;

		// If we must refresh
		if (Refresh) CharacterOnlineRefresh(Char, data, SourceMemberNumber);

	}

	// Returns the character
	return Char;

}

// Deletes an NPC from the buffer
function CharacterDelete(NPCType) {
	for (var C = 0; C < Character.length; C++)
		if (Character[C].AccountName == NPCType) {
			Character.splice(C, 1);
			return;
		}
}

// Adds new effects on a character if it's not already there
function CharacterAddPose(C, NewPose) {
	for (var E = 0; E < NewPose.length; E++)
		if (C.Pose.indexOf(NewPose[E]) < 0)
			C.Pose.push(NewPose[E]);
}

// Resets the current pose list on a character
function CharacterLoadPose(C) {	
	C.Pose = [];
	if (C.ActivePose != null) C.Pose.push(C.ActivePose);
	for (var A = 0; A < C.Appearance.length; A++) {
		if ((C.Appearance[A].Property != null) && (C.Appearance[A].Property.SetPose != null))
			CharacterAddPose(C, C.Appearance[A].Property.SetPose);
		else
			if (C.Appearance[A].Asset.SetPose != null)
				CharacterAddPose(C, C.Appearance[A].Asset.SetPose);
			else
				if (C.Appearance[A].Asset.Group.SetPose != null)
					CharacterAddPose(C, C.Appearance[A].Asset.Group.SetPose);
	}	
}

// Adds new effects on a character if it's not already there
function CharacterAddEffect(C, NewEffect) {
	for (var E = 0; E < NewEffect.length; E++)
		if (C.Effect.indexOf(NewEffect[E]) < 0)
			C.Effect.push(NewEffect[E]);
}

// Resets the current effect list on a character
function CharacterLoadEffect(C) {
	C.Effect = [];
	for (var A = 0; A < C.Appearance.length; A++) {
		if ((C.Appearance[A].Property != null) && (C.Appearance[A].Property.Effect != null)) CharacterAddEffect(C, C.Appearance[A].Property.Effect);
		if (C.Appearance[A].Asset.Effect != null)
			CharacterAddEffect(C, C.Appearance[A].Asset.Effect);
		else
			if (C.Appearance[A].Asset.Group.Effect != null)
				CharacterAddEffect(C, C.Appearance[A].Asset.Group.Effect);
	}	
}

// Sorts the character appearance by priority and loads the canvas
function CharacterLoadCanvas(C) {
		
	// Sorts the full appearance arraw first
	var App = [];
	for (var I = 0; I < 101 && App.length < C.Appearance.length; I++)
		for (var A = 0; A < C.Appearance.length; A++)
			if (C.Appearance[A].Asset.Group.DrawingPriority == I)
				App.push(C.Appearance[A]);
	C.Appearance = App;
	
	// Sets the total height modifier for that character
	C.HeightModifier = 0;
	for (var A = 0; A < C.Appearance.length; A++)
		C.HeightModifier = C.HeightModifier + C.Appearance[A].Asset.HeightModifier;	
	if (C.Pose != null)
		for (var A = 0; A < C.Pose.length; A++)
			for (var P = 0; P < Pose.length; P++)
				if (Pose[P].Name == C.Pose[A])
					if (Pose[P].OverrideHeight != null)
						C.HeightModifier = Pose[P].OverrideHeight;

	// Reload the canvas
	CharacterAppearanceBuildCanvas(C);

}

// Reload all characters canvas
function CharacterLoadCanvasAll() {
	for (var C = 0; C < Character.length; C++)
		if (Character[C].MustDraw) {
			CharacterLoadCanvas(Character[C]);
			Character[C].MustDraw = false;
		}
}

// Sets the current character for conversation with introduction
function CharacterSetCurrent(C) {
	CurrentCharacter = C;
	var NewDialog = DialogIntro();
	if (!Player.CanTalk()) NewDialog = DialogFind(CurrentCharacter, "PlayerGagged", "");
	if (NewDialog != "") C.CurrentDialog = NewDialog;
}

// Changes the character money and sync with the account server
function CharacterChangeMoney(C, Value) {
	C.Money = parseInt(C.Money) + parseInt(Value) * ((Value > 0) ? CheatFactor("DoubleMoney", 2) : 1);
	ServerPlayerSync();
}

// Refreshes the character parameters
function CharacterRefresh(C, Push) {
	CharacterLoadEffect(C);
	CharacterLoadPose(C);
	CharacterLoadCanvas(C);
	if ((C.ID == 0) && (C.OnlineID != null) && ((Push == null) || (Push == true))) ServerPlayerAppearanceSync();
}

// Returns TRUE if a character has no item (the slave collar doesn't count)
function CharacterHasNoItem(C) {
	for(var A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Category == "Item"))
			if (C.Appearance[A].Asset.Name != "SlaveCollar")
				return false;
	return true;
}

// Returns TRUE if a character is naked
function CharacterIsNaked(C) {
	for(var A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Category == "Appearance") && C.Appearance[A].Asset.Group.AllowNone && !C.Appearance[A].Asset.Group.KeepNaked) 
			return false;
	return true;
}

// Returns TRUE if a character is in her underwear
function CharacterIsInUnderwear(C) {
	for(var A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Category == "Appearance") && C.Appearance[A].Asset.Group.AllowNone && !C.Appearance[A].Asset.Group.KeepNaked && !C.Appearance[A].Asset.Group.Underwear)
			return false;
	return true;
}

// Removes all appearance items from the character
function CharacterNaked(C) {
	CharacterAppearanceNaked(C);
	AssetReload(C);
	C.Appearance = CharacterAppearanceSort(C.Appearance);
	CharacterRefresh(C);
}

// Dress the character in random underwear
function CharacterRandomUnderwear(C) {

	// Clear the current clothes
	for (var A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset.Group.Category == "Appearance") && C.Appearance[A].Asset.Group.AllowNone) {
			C.Appearance.splice(A, 1);
			A--;
		}

	// Generate random undies at a random color
	var Color = "";
	for(var A = 0; A < AssetGroup.length; A++)
		if ((AssetGroup[A].Category == "Appearance") && AssetGroup[A].Underwear && (AssetGroup[A].IsDefault || (Math.random() < 0.2))) {
			var Group = [];
			if (Color == "") Color = CommonRandomItemFromList("", AssetGroup[A].ColorSchema);
			for(var I = 0; I < Asset.length; I++)
				if ((Asset[I].Group.Name == AssetGroup[A].Name) && ((Asset[I].Value == 0) || InventoryAvailable(C, Asset[I].Name, Asset[I].Group.Name)))
					Group.push(Asset[I]);
			if (Group.length > 0)
				CharacterAppearanceSetItem(C, AssetGroup[A].Name, Group[Math.floor(Group.length * Math.random())], Color);
		}

	// Refreshes the character
	AssetReload(C);
	C.Appearance = CharacterAppearanceSort(C.Appearance);
	CharacterRefresh(C);

}

// Removes all appearance items from the character expect underwear
function CharacterUnderwear(C, Appearance) {
	CharacterAppearanceNaked(C);
	for(var A = 0; A < Appearance.length; A++)
		if ((Appearance[A].Asset != null) && Appearance[A].Asset.Group.Underwear && (Appearance[A].Asset.Group.Category == "Appearance"))
			C.Appearance.push(Appearance[A]);
	AssetReload(C);
	C.Appearance = CharacterAppearanceSort(C.Appearance);
	CharacterRefresh(C);
}

// Redress the character based on a specific appearance object
function CharacterDress(C, Appearance) {
	if ((Appearance != null) && (Appearance.length > 0)) {
		for(var A = 0; A < Appearance.length; A++)
			if ((Appearance[A].Asset != null) && (Appearance[A].Asset.Group.Category == "Appearance"))
				if (InventoryGet(C, Appearance[A].Asset.Group.Name) == null)
					C.Appearance.push(Appearance[A]);
		AssetReload(C);
		C.Appearance = CharacterAppearanceSort(C.Appearance);
		CharacterRefresh(C);
	}
}

// Removes any binding item from the character
function CharacterRelease(C) {
	for(var E = 0; E < C.Appearance.length; E++)
		if (C.Appearance[E].Asset.Group.IsRestraint) {
			C.Appearance.splice(E, 1);
			E--;
		}
	CharacterRefresh(C);
}

// Returns the best bonus factor available
function CharacterGetBonus(C, BonusType) {
	var Bonus = 0;
	for(var I = 0; I < C.Inventory.length; I++)
		if ((C.Inventory[I].Asset != null) && (C.Inventory[I].Asset.Bonus != null))
			for(var B = 0; B < C.Inventory[I].Asset.Bonus.length; B++)
				if ((C.Inventory[I].Asset.Bonus[B].Type == BonusType) && (C.Inventory[I].Asset.Bonus[B].Factor > Bonus))
					Bonus = C.Inventory[I].Asset.Bonus[B].Factor;
	return Bonus;
}

// Fully restrain a character with random items
function CharacterFullRandomRestrain(C, Ratio) {
	
	// Sets the ratio depending on the parameter
	var RatioRare = 0.75;
	var RatioNormal = 0.25;	
	if (Ratio != null) {
		if (Ratio.trim().toUpperCase() == "FEW") { RatioRare = 1; RatioNormal = 0.5; }
		if (Ratio.trim().toUpperCase() == "LOT") { RatioRare = 0.5; RatioNormal = 0; }
		if (Ratio.trim().toUpperCase() == "ALL") { RatioRare = 0; RatioNormal = 0; }
	}

	// Apply each item if needed
	if (InventoryGet(C, "ItemArms") == null) InventoryWearRandom(C, "ItemArms");
	if ((Math.random() >= RatioRare) && (InventoryGet(C, "ItemHead") == null)) InventoryWearRandom(C, "ItemHead");
	if ((Math.random() >= RatioNormal) && (InventoryGet(C, "ItemMouth") == null)) InventoryWearRandom(C, "ItemMouth");
	if ((Math.random() >= RatioRare) && (InventoryGet(C, "ItemNeck") == null)) InventoryWearRandom(C, "ItemNeck");
	if ((Math.random() >= RatioNormal) && (InventoryGet(C, "ItemLegs") == null)) InventoryWearRandom(C, "ItemLegs");
	if ((Math.random() >= RatioNormal) && !C.IsKneeling() && (InventoryGet(C, "ItemFeet") == null)) InventoryWearRandom(C, "ItemFeet");

}

// Sets a new pose for the character
function CharacterSetActivePose(C, NewPose) {
	C.ActivePose = NewPose;
	CharacterRefresh(C, false);
}

// Sets a specific facial expression for the character's specified AssetGruo
function CharacterSetFacialExpression(C, AssetGroup, Expression) {
	for (var A = 0; A < C.Appearance.length; A++) {
		if ((C.Appearance[A].Asset.Group.Name == AssetGroup) && (C.Appearance[A].Asset.Group.AllowExpression)) {
			if ((Expression == null) || (C.Appearance[A].Asset.Group.AllowExpression.indexOf(Expression) >= 0)) {
				if (!C.Appearance[A].Property) C.Appearance[A].Property = {};
				if (C.Appearance[A].Property.Expression != Expression) {
					C.Appearance[A].Property.Expression = Expression;
					CharacterRefresh(C);
					ChatRoomCharacterUpdate(C);
				}
				return;
			}
		}
	}
}

// Resets the character's facial expression to the default
function CharacterResetFacialExpression(C) {
	for (var A = 0; A < C.Appearance.length; A++)
		if (C.Appearance[A].Asset.Group.AllowExpression)
			CharacterSetFacialExpression(C, C.Appearance[A].Asset.Group.Name, null);
}


// returns the current selected character
function CharacterGetCurrent() {
	return (Player.FocusGroup != null) ? Player : CurrentCharacter;
}
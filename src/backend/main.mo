import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Color = { r : Nat8; g : Nat8; b : Nat8 };
  type Shape = { #circle : Nat; #square : Nat; #triangle : Nat };

  type LogoSpecification = {
    colors : [Color];
    shapes : [Shape];
    style : Text;
  };

  module LogoSpecification {
    public func compare(a : LogoSpecification, b : LogoSpecification) : Order.Order {
      Text.compare(a.style, b.style);
    };
  };

  type GeneratedLogoProject = {
    description : Text;
    logoSpecification : LogoSpecification;
    timestamp : Int;
  };

  public type GeneratedLogoProjectSerialized = {
    description : Text;
    logoSpecification : LogoSpecification;
    timestamp : Int;
  };

  module GeneratedLogoProject {
    public func compare(a : GeneratedLogoProject, b : GeneratedLogoProject) : Order.Order {
      switch (Text.compare(a.description, b.description)) {
        case (#equal) { Int.compare(a.timestamp, b.timestamp) };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let logoProjects = Map.empty<Principal, List.List<GeneratedLogoProject>>();
  let viewedProjects = Map.empty<Principal, Set.Set<Text>>();
  let favoriteProjects = Map.empty<Principal, Set.Set<Text>>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveGeneratedLogoProject(description : Text, logoSpec : LogoSpecification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save projects.");
    };

    let newProject = {
      description;
      logoSpecification = logoSpec;
      timestamp = Time.now();
    };

    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    userProjects.add(newProject);
    logoProjects.add(caller, userProjects);
  };

  public query ({ caller }) func getSortedLogoProjects() : async [GeneratedLogoProjectSerialized] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access projects.");
    };

    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    userProjects.toArray().map(func(p) { p }).sort();
  };

  public shared ({ caller }) func markAsViewed(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark projects as viewed.");
    };

    let userViewed = switch (viewedProjects.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?viewed) { viewed };
    };

    userViewed.add(projectId);
    viewedProjects.add(caller, userViewed);
  };

  public query ({ caller }) func getViewedProjects() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access viewed projects.");
    };

    switch (viewedProjects.get(caller)) {
      case (null) { [] };
      case (?viewed) { viewed.toArray() };
    };
  };

  public query ({ caller }) func searchProjectsByDescription(searchTerm : Text) : async [GeneratedLogoProjectSerialized] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search projects.");
    };

    let termLower = searchTerm.toLower();
    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    let filteredIter = userProjects.values().filter(
      func(project) {
        project.description.toLower().contains(#text termLower);
      }
    );

    filteredIter.toArray().map(func(p) { p });
  };

  public shared ({ caller }) func addToFavorites(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add favorites.");
    };

    let userFavorites = switch (favoriteProjects.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?favorites) { favorites };
    };

    if (userFavorites.contains(projectId)) {
      Runtime.trap("Project already in favorites");
    };
    userFavorites.add(projectId);
    favoriteProjects.add(caller, userFavorites);
  };

  public shared ({ caller }) func removeFromFavorites(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove favorites.");
    };

    let userFavorites = switch (favoriteProjects.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?favorites) { favorites };
    };

    if (not userFavorites.contains(projectId)) {
      Runtime.trap("Project not in favorites");
    };
    userFavorites.remove(projectId);
    favoriteProjects.add(caller, userFavorites);
  };

  public shared ({ caller }) func cloneProject(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clone projects.");
    };
    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    let clonedProjects = userProjects.filter(
      func(project) {
        project.description == projectId;
      }
    );

    if (clonedProjects.isEmpty()) {
      Runtime.trap("Project not found");
    };

    switch (clonedProjects.first()) {
      case (?clonedProject) {
        userProjects.add(clonedProject);
        logoProjects.add(caller, userProjects);
      };
      case (null) {
        Runtime.trap("Project not found after filtering");
      };
    };
  };

  public shared ({ caller }) func editProject(projectId : Text, newDescription : Text, newLogoSpec : LogoSpecification) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit projects.");
    };

    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    let updatedProjects = userProjects.map<GeneratedLogoProject, GeneratedLogoProject>(
      func(project) {
        if (project.description == projectId) {
          {
            description = newDescription;
            logoSpecification = newLogoSpec;
            timestamp = Time.now();
          };
        } else {
          project;
        };
      }
    );
    logoProjects.add(caller, updatedProjects);
  };

  public shared ({ caller }) func deleteProject(projectId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects.");
    };

    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    let filteredProjects = userProjects.filter(
      func(project) {
        project.description != projectId;
      }
    );

    logoProjects.add(caller, filteredProjects);
  };

  public query ({ caller }) func getFavorites() : async [GeneratedLogoProjectSerialized] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access favorites.");
    };

    let userFavorites = switch (favoriteProjects.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?favorites) { favorites };
    };

    let userProjects = switch (logoProjects.get(caller)) {
      case (null) { List.empty<GeneratedLogoProject>() };
      case (?projects) { projects };
    };

    let favoritesArray = userFavorites.toArray();
    let filteredProjects = userProjects.filter(
      func(project) {
        favoritesArray.find(func(id) { id == project.description }) != null;
      }
    );

    filteredProjects.toArray().map(func(p) { p });
  };
};

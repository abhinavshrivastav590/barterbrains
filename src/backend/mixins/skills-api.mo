import Map "mo:core/Map";
import List "mo:core/List";
import SkillLib "../lib/skills";
import SkillTypes "../types/skills";
import CommonTypes "../types/common";

mixin (
  skills : Map.Map<CommonTypes.SkillId, SkillTypes.Skill>,
) {
  var nextSkillId : Nat = 1;

  public query func listSkills() : async [SkillTypes.Skill] {
    SkillLib.listSkills(skills);
  };

  public query func searchSkills(searchQuery : Text) : async [SkillTypes.Skill] {
    SkillLib.searchSkills(skills, searchQuery);
  };

  public shared ({ caller = _ }) func addSkill(name : Text) : async SkillTypes.Skill {
    let skill = SkillLib.addSkill(skills, nextSkillId, name);
    nextSkillId += 1;
    skill;
  };
};

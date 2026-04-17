import Map "mo:core/Map";
import Array "mo:core/Array";
import SkillTypes "../types/skills";
import CommonTypes "../types/common";

module {
  public func listSkills(
    skills : Map.Map<CommonTypes.SkillId, SkillTypes.Skill>,
  ) : [SkillTypes.Skill] {
    var results : [SkillTypes.Skill] = [];
    for ((_, skill) in skills.entries()) {
      results := results.concat([skill]);
    };
    results;
  };

  public func addSkill(
    skills : Map.Map<CommonTypes.SkillId, SkillTypes.Skill>,
    nextId : Nat,
    name : Text,
  ) : SkillTypes.Skill {
    let skill : SkillTypes.Skill = { id = nextId; name = name };
    skills.add(nextId, skill);
    skill;
  };

  public func searchSkills(
    skills : Map.Map<CommonTypes.SkillId, SkillTypes.Skill>,
    searchQuery : Text,
  ) : [SkillTypes.Skill] {
    let lower = searchQuery.toLower();
    var results : [SkillTypes.Skill] = [];
    for ((_, skill) in skills.entries()) {
      if (skill.name.toLower().contains(#text lower)) {
        results := results.concat([skill]);
      };
    };
    results;
  };
};

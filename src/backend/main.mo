import Map "mo:core/Map";
import List "mo:core/List";
import ProfileTypes "types/profile";
import SkillTypes "types/skills";
import MatchTypes "types/matching";
import ChatTypes "types/chat";
import SessionTypes "types/sessions";
import ReviewTypes "types/reviews";
import NotificationTypes "types/notifications";
import CommonTypes "types/common";
import ProfileMixin "mixins/profile-api";
import SkillsMixin "mixins/skills-api";
import MatchingMixin "mixins/matching-api";
import ChatMixin "mixins/chat-api";
import SessionsMixin "mixins/sessions-api";
import ReviewsMixin "mixins/reviews-api";
import NotificationsMixin "mixins/notifications-api";
import DashboardMixin "mixins/dashboard-api";

actor {
  // Profiles
  let profiles = Map.empty<CommonTypes.UserId, ProfileTypes.UserProfile>();
  include ProfileMixin(profiles);

  // Skills catalog
  let skills = Map.empty<CommonTypes.SkillId, SkillTypes.Skill>();
  include SkillsMixin(skills);

  // Bidirectional matches
  let matches = List.empty<MatchTypes.Match>();
  include MatchingMixin(profiles, matches);

  // Chat messages
  let messages = List.empty<ChatTypes.Message>();
  include ChatMixin(messages, profiles);

  // Notifications
  let notifications = Map.empty<CommonTypes.UserId, List.List<NotificationTypes.Notification>>();
  include NotificationsMixin(notifications);

  // Sessions
  let sessions = List.empty<SessionTypes.Session>();
  include SessionsMixin(sessions, notifications);

  // Reviews
  let reviews = List.empty<ReviewTypes.Review>();
  include ReviewsMixin(reviews, sessions, profiles);

  // Dashboard
  include DashboardMixin(sessions, reviews);
};

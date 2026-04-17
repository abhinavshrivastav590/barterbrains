import Map "mo:core/Map";
import List "mo:core/List";
import NotifLib "../lib/notifications";
import NotificationTypes "../types/notifications";
import CommonTypes "../types/common";

mixin (
  notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
) {
  public query ({ caller }) func getNotifications() : async [NotificationTypes.NotificationPublic] {
    NotifLib.getNotifications(notifications, caller);
  };

  public query ({ caller }) func getNotificationBadgeCount() : async Nat {
    NotifLib.getBadgeCount(notifications, caller);
  };

  public shared ({ caller }) func dismissNotification(notificationId : CommonTypes.NotificationId) : async () {
    NotifLib.dismiss(notifications, caller, notificationId);
  };
};

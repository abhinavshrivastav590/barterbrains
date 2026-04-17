import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import NotificationTypes "../types/notifications";
import CommonTypes "../types/common";

module {
  /// Push a notification to a user. Returns the next notification id (incremented).
  public func push(
    notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
    nextId : Nat,
    userId : CommonTypes.UserId,
    kind : NotificationTypes.NotificationKind,
  ) : Nat {
    let notification : NotificationTypes.Notification = {
      id = nextId;
      userId = userId;
      kind = kind;
      var dismissed = false;
      createdAt = Time.now();
    };
    switch (notifications.get(userId)) {
      case (?list) { list.add(notification) };
      case null {
        let newList = List.empty<NotificationTypes.Notification>();
        newList.add(notification);
        notifications.add(userId, newList);
      };
    };
    nextId + 1;
  };

  public func getNotifications(
    notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
    caller : CommonTypes.UserId,
  ) : [NotificationTypes.NotificationPublic] {
    switch (notifications.get(caller)) {
      case (?list) {
        var results : [NotificationTypes.NotificationPublic] = [];
        for (n in list.values()) {
          if (not n.dismissed) {
            results := results.concat([toPublic(n)]);
          };
        };
        results;
      };
      case null [];
    };
  };

  public func getBadgeCount(
    notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
    caller : CommonTypes.UserId,
  ) : Nat {
    switch (notifications.get(caller)) {
      case (?list) {
        var count : Nat = 0;
        for (n in list.values()) {
          if (not n.dismissed) { count += 1 };
        };
        count;
      };
      case null 0;
    };
  };

  public func dismiss(
    notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
    caller : CommonTypes.UserId,
    notificationId : CommonTypes.NotificationId,
  ) {
    switch (notifications.get(caller)) {
      case (?list) {
        list.mapInPlace(func(n : NotificationTypes.Notification) : NotificationTypes.Notification {
          if (Nat.equal(n.id, notificationId)) {
            n.dismissed := true;
          };
          n;
        });
      };
      case null {};
    };
  };

  public func toPublic(self : NotificationTypes.Notification) : NotificationTypes.NotificationPublic {
    {
      id = self.id;
      kind = self.kind;
      dismissed = self.dismissed;
      createdAt = self.createdAt;
    };
  };
};

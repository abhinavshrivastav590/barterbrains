import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import SessionLib "../lib/sessions";
import NotifLib "../lib/notifications";
import SessionTypes "../types/sessions";
import NotificationTypes "../types/notifications";
import CommonTypes "../types/common";

mixin (
  sessions : List.List<SessionTypes.Session>,
  notifications : Map.Map<CommonTypes.UserId, List.List<NotificationTypes.Notification>>,
) {
  var nextSessionId : Nat = 1;
  var nextNotificationId : Nat = 1;

  public shared ({ caller }) func requestSession(input : SessionTypes.SessionRequest) : async SessionTypes.SessionPublic {
    let session = SessionLib.requestSession(sessions, nextSessionId, caller, input);
    nextSessionId += 1;
    // Notify receiver
    nextNotificationId := NotifLib.push(
      notifications,
      nextNotificationId,
      input.receiverId,
      #sessionRequest { sessionId = session.id; fromUserId = caller },
    );
    session;
  };

  public shared ({ caller }) func respondToSession(sessionId : CommonTypes.SessionId, accept : Bool) : async SessionTypes.SessionPublic {
    let session = SessionLib.respondToSession(sessions, caller, sessionId, accept);
    // Notify requester
    let kind : NotificationTypes.NotificationKind = if (accept) {
      #sessionAccepted { sessionId = session.id };
    } else {
      #sessionRejected { sessionId = session.id };
    };
    nextNotificationId := NotifLib.push(notifications, nextNotificationId, session.requesterId, kind);
    session;
  };

  public shared ({ caller }) func completeSession(sessionId : CommonTypes.SessionId) : async SessionTypes.SessionPublic {
    let session = SessionLib.completeSession(sessions, caller, sessionId);
    // Notify both participants
    let otherId = if (Principal.equal(session.requesterId, caller)) session.receiverId else session.requesterId;
    nextNotificationId := NotifLib.push(
      notifications,
      nextNotificationId,
      otherId,
      #sessionCompleted { sessionId = session.id },
    );
    session;
  };

  public query ({ caller }) func getActiveSessions() : async [SessionTypes.SessionPublic] {
    SessionLib.getActiveSessions(sessions, caller);
  };

  public query ({ caller }) func getCompletedSessions() : async [SessionTypes.SessionPublic] {
    SessionLib.getCompletedSessions(sessions, caller);
  };
};

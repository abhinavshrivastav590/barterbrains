import Map "mo:core/Map";
import List "mo:core/List";
import ChatLib "../lib/chat";
import ChatTypes "../types/chat";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

mixin (
  messages : List.List<ChatTypes.Message>,
  profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
) {
  var nextMessageId : Nat = 1;

  public shared ({ caller }) func sendMessage(
    receiverId : CommonTypes.UserId,
    content : Text,
  ) : async ChatTypes.MessagePublic {
    let msg = ChatLib.sendMessage(messages, nextMessageId, caller, receiverId, content);
    nextMessageId += 1;
    msg;
  };

  public query ({ caller }) func getMessages(
    partnerId : CommonTypes.UserId,
    since : ?CommonTypes.Timestamp,
  ) : async [ChatTypes.MessagePublic] {
    ChatLib.getMessages(messages, caller, partnerId, since);
  };

  public shared ({ caller }) func markMessagesRead(partnerId : CommonTypes.UserId) : async () {
    ChatLib.markRead(messages, caller, partnerId);
  };

  public query ({ caller }) func getConversations() : async [ChatTypes.Conversation] {
    ChatLib.getConversations(messages, profiles, caller);
  };
};

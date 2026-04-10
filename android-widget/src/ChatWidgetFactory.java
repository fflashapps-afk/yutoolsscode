package com.yutoolss.codestudio.widget;

import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import com.yutoolss.codestudio.R;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.android.gms.tasks.Tasks;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

public class ChatWidgetFactory implements RemoteViewsService.RemoteViewsFactory {

    private Context context;
    private List<ChatItem> chatItems = new ArrayList<>();

    public ChatWidgetFactory(Context context, Intent intent) {
        this.context = context;
    }

    @Override
    public void onCreate() {}

    @Override
    public void onDataSetChanged() {
        // Fetch data from Firestore synchronously
        FirebaseFirestore db = FirebaseFirestore.getInstance();
        try {
            List<QueryDocumentSnapshot> documents = Tasks.await(
                db.collection("global_chat")
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .limit(20)
                    .get()
            ).getDocuments();

            chatItems.clear();
            for (QueryDocumentSnapshot doc : documents) {
                chatItems.add(new ChatItem(
                    doc.getString("userName"),
                    doc.getString("content")
                ));
            }
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        chatItems.clear();
    }

    @Override
    public int getCount() {
        return chatItems.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position >= chatItems.size()) return null;

        ChatItem item = chatItems.get(position);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.chat_widget_item);
        views.setTextViewText(R.id.msg_user, item.userName);
        views.setTextViewText(R.id.msg_content, item.content);

        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    private static class ChatItem {
        String userName;
        String content;

        ChatItem(String userName, String content) {
            this.userName = userName;
            this.content = content;
        }
    }
}

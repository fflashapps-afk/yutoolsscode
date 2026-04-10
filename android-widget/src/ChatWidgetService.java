package com.yutoolss.codestudio.widget;

import android.content.Intent;
import android.widget.RemoteViewsService;

public class ChatWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new ChatWidgetFactory(this.getApplicationContext(), intent);
    }
}

from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns
from api.game.views import DeckList

urlpatterns = {
    url(r'^decks/$', DeckList.as_view(), name='deck'),
}

urlpatterns = format_suffix_patterns(urlpatterns)

create database remote:localhost:2430/fenix_catalog_1.0 root root plocal graph;

create class ResourceType;
create property ResourceType.type string;
alter property ResourceType.type mandatory true;
create index ResourceType.type unique;

create class Plugin;
create property Plugin.component string;
alter property Plugin.component mandatory true;
create property Plugin.name string;
alter property Plugin.name mandatory true;
create property Plugin.className string;
create property Plugin.requiredParameters embeddedset string;
create property Plugin.optionalParameters embeddedset string;
create index Plugin.key on Plugin (component,name) unique;

create class Source;
create property Source.name string;
alter property Source.name mandatory true;
create index Source.name unique;

create class Connector;
create property Connector.resourceType link ResourceType;
alter property Connector.resourceType mandatory true;
create property Connector.plugin link Plugin;
alter property Connector.plugin mandatory true;
create property Connector.source link Source;
alter property Connector.source mandatory true;
create index Connector.key on Connector (plugin,source) unique;
create index Connector.resourceType notunique;


create class Resource extends V;
create property Resource.resourceType link ResourceType;
alter property Resource.resourceType mandatory true;
create index Resource.resourceType notunique;

create class Relation extends E;

disconnect;
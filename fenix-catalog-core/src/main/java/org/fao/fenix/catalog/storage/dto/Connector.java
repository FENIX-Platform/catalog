package org.fao.fenix.catalog.storage.dto;

import org.codehaus.jackson.annotate.JsonAutoDetect;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonMethod;
import org.codehaus.jackson.annotate.JsonProperty;
import org.fao.fenix.tools.orient.OrientClass;

@OrientClass
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect({JsonMethod.NONE})
public class Connector {

    private ResourceType resourceType;
    private Source source;
    private Plugin plugin;

    @JsonProperty
    public ResourceType getResourceType() {
        return resourceType;
    }

    @JsonProperty
    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    @JsonProperty
    public Source getSource() {
        return source;
    }

    @JsonProperty
    public void setSource(Source source) {
        this.source = source;
    }

    @JsonProperty
    public Plugin getPlugin() {
        return plugin;
    }

    @JsonProperty
    public void setPlugin(Plugin plugin) {
        this.plugin = plugin;
    }
}

package org.fao.fenix.catalog.storage.dto;

import org.codehaus.jackson.annotate.JsonAutoDetect;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonMethod;
import org.codehaus.jackson.annotate.JsonProperty;
import org.fao.fenix.catalog.tools.orient.OrientClass;

@OrientClass()
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect({JsonMethod.NONE})
public class ResourceType {

    private String type;

    @JsonProperty
    public String getType() {
        return type;
    }

    @JsonProperty
    public void setType(String type) {
        this.type = type;
    }
}

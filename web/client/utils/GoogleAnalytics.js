export const sendEvent = (event, resource) => {
    try {
        gtag('event', event, {
            resource_type: resource.resource_type,
            resource_pk: resource.pk,
            resource_name: resource.title,
            resource_alternate: resource.alternate
        });
    } catch (e) {
        console.error(e);
        console.error(resource);
    }
};

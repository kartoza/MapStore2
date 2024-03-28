/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';
import {
    compose,
    defaultProps,
    getContext,
    withHandlers,
    withStateHandlers
} from 'recompose';


import {getMessageById} from '../../../utils/LocaleUtils';
import Message from '../../I18N/Message';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import withConfirm from '../../misc/withConfirm';

function getImageDimensions(src, callback) {
    const img = new Image();
    img.onload = () => {
        callback({
            imgWidth: img.naturalWidth,
            imgHeight: img.naturalHeight
        });
    };
    img.onerror = () => {
        callback({});
    };
    img.src = src;
}

const form = [
    {
        placeholder: "mediaEditor.mediaPicker.sourcePlaceholder",
        type: "text",
        id: "src",
        label: <Message msgId = "mediaEditor.mediaPicker.source"/>,
        validation: ({ src }) => src !== undefined && src === "" ?
            "error"
            : src
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.mediaPicker.titlePlaceholder",
        type: "text",
        id: "title",
        label: <Message msgId = "mediaEditor.mediaPicker.title"/>,
        validation: ({ title }) => title !== undefined && title === "" ?
            "error"
            : title
                ? "success"
                : undefined
    },
    {
        placeholder: "mediaEditor.mediaPicker.altTextPlaceholder",
        type: "text",
        id: "alt",
        label: <Message msgId = "mediaEditor.mediaPicker.altText"/>
    },
    {
        placeholder: "mediaEditor.mediaPicker.descriptionPlaceholder",
        type: "text",
        id: "description",
        label: <Message msgId = "mediaEditor.mediaPicker.description"/>
    },
    {
        placeholder: "mediaEditor.mediaPicker.creditsPlaceholder",
        type: "text",
        id: "credits",
        label: <Message msgId = "mediaEditor.mediaPicker.credits"/>
    }
];

const enhance = compose(
    defaultProps({
        confirmTitle: <Message msgId = "mediaEditor.mediaform.confirmExitTitle"/>,
        confirmContent: <Message msgId = "mediaEditor.mediaform.confirmExitContent"/>,
        getImageDimensionsFunc: getImageDimensions
    }),
    withStateHandlers(
        ({selectedItem = {}, editing}) => ({
            properties: editing ? {...selectedItem.data} : {},
            confirmPredicate: false
        }),
        {
            setProperties: (state) => (properties) => ({
                properties: { ...state.properties, ...properties },
                confirmPredicate: true
            })
        }),
    withHandlers({
        onClick: ({setAddingMedia, setEditingMedia, editing}) => () => {
            editing && setEditingMedia(false) || setAddingMedia(false);
        }
    }),
    withConfirm,
    getContext({messages: {}})
);


export default enhance(({
    properties = {},
    onClick = () => {},
    setProperties = () => {},
    onSave = () => {},
    messages,
    getImageDimensionsFunc
}) => {
    const [filerUrl, setFilerUrl] = useState(null);

    // Fetch data
    useEffect(() => {
        if (!filerUrl) {
            (
                async() => {
                    const response = await fetch('/user-filer-url/');
                    const url = await response.json();
                    setFilerUrl(url);
                }
            )();
        }
    }, []);

    const buttons = [
        {
            glyph: "arrow-left",
            tooltipId: "mediaEditor.mediaPicker.back",
            onClick
        }, {
            glyph: "floppy-disk",
            tooltipId: "mediaEditor.mediaPicker.save",
            disabled: !properties.src || !properties.title,
            onClick: () => {
                getImageDimensionsFunc(properties.src,
                    (dimensions) =>
                        onSave({ ...properties, ...dimensions })
                );
            }
        }
    ];

    if (filerUrl) {
        // TODO: Delft Specified
        buttons.push(
            {
                glyph: "folder-open",
                tooltipId: "mediaEditor.mediaPicker.browseImage",
                onClick: () => {
                    let identifier = '' + new Date().getTime();
                    window.open(filerUrl, identifier, "popup=true");
                    window.addEventListener(
                        'message', (event) => {
                            if (event.source?.name === identifier) {
                                setProperties({
                                    ...properties,
                                    src: event.data.url,
                                    title: event.data.name
                                });
                            }
                        }, false
                    );
                }
            }
        );
    }
    return <BorderLayout
        className="ms-imageForm"
        header={
            <div
                className="text-center"
                key="toolbar"
                style={{
                    borderBottom: "1px solid #ddd",
                    padding: 8
                }}>
                <Toolbar
                    btnGroupProps={{
                        style: {
                            marginBottom: 8
                        }
                    }}
                    btnDefaultProps={{
                        bsStyle: "primary",
                        className: "square-button-md"
                    }}
                    buttons={buttons}/>
            </div>
        }>
        <Form style={{ padding: 8 }}>
            {form.map((field) => (
                <FormGroup
                    key={field.id}
                    validationState={field.validation && field.validation(properties)}>
                    <ControlLabel>
                        {field.label}
                    </ControlLabel>
                    <FormControl
                        type={field.type}
                        placeholder={getMessageById(messages, field.placeholder)}
                        value={properties[field.id] || ""}
                        onChange={(event) => {
                            setProperties({
                                ...properties,
                                [field.id]: event.target.value
                            });
                        }} />
                </FormGroup>
            ))}
        </Form>
    </BorderLayout>;
});

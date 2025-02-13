import { expectNotAssignable } from 'tsd';

import { hooks } from '../../src/module/exports-minimal';

type StyleOptions = ReturnType<typeof hooks.useStyleOptions>[0];

// const [styleOptions] = hooks.useStyleOptions();

expectNotAssignable<StyleOptions>({ cardEmphasisBackgroundColor: 'black' });

// Equivalent to: styleOptions.cardEmphasisBackgroundColor = 'black';

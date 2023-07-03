interface Emoji {
  alias: string[] | string;
  unicode: string;
  category: string;
}

const emoji: Emoji[] = [
  {
    alias: ['+1', 'thumbsup'],
    unicode: '👍',
    category: 'Gesture',
  },
  {
    alias: ['-1', 'thumbsdown'],
    unicode: '👎',
    category: 'Gesture',
  },
  {
    alias: '100',
    unicode: '💯',
    category: 'Symbol',
  },
  {
    alias: '1234',
    unicode: '🔢',
    category: 'Symbol',
  },
  {
    alias: '1st_place_medal',
    unicode: '🥇',
    category: 'Activity',
  },
  {
    alias: '2nd_place_medal',
    unicode: '🥈',
    category: 'Activity',
  },
  {
    alias: '3rd_place_medal',
    unicode: '🥉',
    category: 'Activity',
  },
  {
    alias: '8ball',
    unicode: '🎱',
    category: 'Activity',
  },
  {
    alias: 'a',
    unicode: '🅰️',
    category: 'Symbol',
  },
  {
    alias: 'ab',
    unicode: '🆎',
    category: 'Symbol',
  },
  {
    alias: 'abacus',
    unicode: '🧮',
    category: 'Object',
  },
  {
    alias: 'abc',
    unicode: '🔤',
    category: 'Symbol',
  },
  {
    alias: 'abcd',
    unicode: '🔡',
    category: 'Symbol',
  },
  {
    alias: 'accept',
    unicode: '🉑',
    category: 'Symbol',
  },
  {
    alias: 'accordion',
    unicode: '🪗',
    category: 'Activity',
  },
  {
    alias: 'adhesive_bandage',
    unicode: '🩹',
    category: 'Object',
  },
  {
    alias: 'adult',
    unicode: '🧑',
    category: 'Person',
  },
  {
    alias: 'aerial_tramway',
    unicode: '🚡',
    category: 'Travel',
  },
  {
    alias: 'afghanistan',
    unicode: '🇦🇫',
    category: 'Country',
  },
  {
    alias: 'airplane',
    unicode: '✈️',
    category: 'Travel',
  },
  {
    alias: 'aland_islands',
    unicode: '🇦🇽',
    category: 'Country',
  },
  {
    alias: 'alarm_clock',
    unicode: '⏰',
    category: 'Object',
  },
  {
    alias: 'albania',
    unicode: '🇦🇱',
    category: 'Country',
  },
  {
    alias: 'alembic',
    unicode: '⚗️',
    category: 'Object',
  },
  {
    alias: 'algeria',
    unicode: '🇩🇿',
    category: 'Country',
  },
  {
    alias: 'alien',
    unicode: '👽',
    category: 'Person',
  },
  {
    alias: 'ambulance',
    unicode: '🚑',
    category: 'Travel',
  },
  {
    alias: 'american_samoa',
    unicode: '🇦🇸',
    category: 'Country',
  },
  {
    alias: 'amphora',
    unicode: '🏺',
    category: 'Object',
  },
  {
    alias: 'anatomical_heart',
    unicode: '🫀',
    category: 'Person',
  },
  {
    alias: 'anchor',
    unicode: '⚓️',
    category: 'Travel',
  },
  {
    alias: 'andorra',
    unicode: '🇦🇩',
    category: 'Country',
  },
  {
    alias: 'angel',
    unicode: '👼',
    category: 'Person',
  },
  {
    alias: 'anger',
    unicode: '💢',
    category: 'Symbol',
  },
  {
    alias: 'angola',
    unicode: '🇦🇴',
    category: 'Country',
  },
  {
    alias: 'angry',
    unicode: '😠',
    category: 'Smiley',
  },
  {
    alias: 'anguilla',
    unicode: '🇦🇮',
    category: 'Country',
  },
  {
    alias: 'anguished',
    unicode: '😧',
    category: 'Smiley',
  },
  {
    alias: 'ant',
    unicode: '🐜',
    category: 'Animal',
  },
  {
    alias: 'antarctica',
    unicode: '🇦🇶',
    category: 'Country',
  },
  {
    alias: 'antigua_barbuda',
    unicode: '🇦🇬',
    category: 'Country',
  },
  {
    alias: 'apple',
    unicode: '🍎',
    category: 'Food',
  },
  {
    alias: 'aquarius',
    unicode: '♒️',
    category: 'Symbol',
  },
  {
    alias: 'argentina',
    unicode: '🇦🇷',
    category: 'Country',
  },
  {
    alias: 'aries',
    unicode: '♈️',
    category: 'Symbol',
  },
  {
    alias: 'armenia',
    unicode: '🇦🇲',
    category: 'Country',
  },
  {
    alias: 'arrow_backward',
    unicode: '◀️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_double_down',
    unicode: '⏬',
    category: 'Symbol',
  },
  {
    alias: 'arrow_double_up',
    unicode: '⏫',
    category: 'Symbol',
  },
  {
    alias: 'arrow_down',
    unicode: '⬇️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_down_small',
    unicode: '🔽',
    category: 'Symbol',
  },
  {
    alias: 'arrow_forward',
    unicode: '▶️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_heading_down',
    unicode: '⤵️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_heading_up',
    unicode: '⤴️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_left',
    unicode: '⬅️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_lower_left',
    unicode: '↙️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_lower_right',
    unicode: '↘️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_right',
    unicode: '➡️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_right_hook',
    unicode: '↪️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_up',
    unicode: '⬆️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_up_down',
    unicode: '↕️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_up_small',
    unicode: '🔼',
    category: 'Symbol',
  },
  {
    alias: 'arrow_upper_left',
    unicode: '↖️',
    category: 'Symbol',
  },
  {
    alias: 'arrow_upper_right',
    unicode: '↗️',
    category: 'Symbol',
  },
  {
    alias: 'arrows_clockwise',
    unicode: '🔃',
    category: 'Symbol',
  },
  {
    alias: 'arrows_counterclockwise',
    unicode: '🔄',
    category: 'Symbol',
  },
  {
    alias: 'art',
    unicode: '🎨',
    category: 'Activity',
  },
  {
    alias: 'articulated_lorry',
    unicode: '🚛',
    category: 'Travel',
  },
  {
    alias: 'artificial_satellite',
    unicode: '🛰',
    category: 'Object',
  },
  {
    alias: 'artist',
    unicode: '🧑‍🎨',
    category: 'Person',
  },
  {
    alias: 'aruba',
    unicode: '🇦🇼',
    category: 'Country',
  },
  {
    alias: 'ascension_island',
    unicode: '🇦🇨',
    category: 'Country',
  },
  {
    alias: 'asterisk',
    unicode: '*️⃣',
    category: 'Symbol',
  },
  {
    alias: 'astonished',
    unicode: '😲',
    category: 'Smiley',
  },
  {
    alias: 'astronaut',
    unicode: '🧑‍🚀',
    category: 'Person',
  },
  {
    alias: 'athletic_shoe',
    unicode: '👟',
    category: 'Clothing',
  },
  {
    alias: 'atm',
    unicode: '🏧',
    category: 'Travel',
  },
  {
    alias: 'atom_symbol',
    unicode: '⚛️',
    category: 'Symbol',
  },
  {
    alias: 'australia',
    unicode: '🇦🇺',
    category: 'Country',
  },
  {
    alias: 'austria',
    unicode: '🇦🇹',
    category: 'Country',
  },
  {
    alias: 'auto_rickshaw',
    unicode: '🛺',
    category: 'Travel',
  },
  {
    alias: 'avocado',
    unicode: '🥑',
    category: 'Food',
  },
  {
    alias: 'axe',
    unicode: '🪓',
    category: 'Object',
  },
  {
    alias: 'azerbaijan',
    unicode: '🇦🇿',
    category: 'Country',
  },
  {
    alias: 'b',
    unicode: '🅱️',
    category: 'Symbol',
  },
  {
    alias: 'baby',
    unicode: '👶',
    category: 'Person',
  },
  {
    alias: 'baby_bottle',
    unicode: '🍼',
    category: 'Object',
  },
  {
    alias: 'baby_chick',
    unicode: '🐤',
    category: 'Animal',
  },
  {
    alias: 'baby_symbol',
    unicode: '🚼',
    category: 'Symbol',
  },
  {
    alias: 'back',
    unicode: '🔙',
    category: 'Symbol',
  },
  {
    alias: 'bacon',
    unicode: '🥓',
    category: 'Food',
  },
  {
    alias: 'badger',
    unicode: '🦡',
    category: 'Animal',
  },
  {
    alias: 'badminton',
    unicode: '🏸',
    category: 'Activity',
  },
  {
    alias: 'bagel',
    unicode: '🥯',
    category: 'Food',
  },
  {
    alias: 'baggage_claim',
    unicode: '🛄',
    category: 'Symbol',
  },
  {
    alias: 'baguette_bread',
    unicode: '🥖',
    category: 'Food',
  },
  {
    alias: 'bahamas',
    unicode: '🇧🇸',
    category: 'Country',
  },
  {
    alias: 'bahrain',
    unicode: '🇧🇭',
    category: 'Country',
  },
  {
    alias: 'balance_scale',
    unicode: '⚖️',
    category: 'Object',
  },
  {
    alias: 'bald_man',
    unicode: '👨‍🦲',
    category: 'Person',
  },
  {
    alias: 'bald_woman',
    unicode: '👩‍🦲',
    category: 'Person',
  },
  {
    alias: 'ballet_shoes',
    unicode: '🩰',
    category: 'Activity',
  },
  {
    alias: 'balloon',
    unicode: '🎈',
    category: 'Object',
  },
  {
    alias: 'ballot_box',
    unicode: '🗳',
    category: 'Object',
  },
  {
    alias: 'ballot_box_with_check',
    unicode: '☑️',
    category: 'Symbol',
  },
  {
    alias: 'bamboo',
    unicode: '🎍',
    category: 'Object',
  },
  {
    alias: 'banana',
    unicode: '🍌',
    category: 'Food',
  },
  {
    alias: 'bangbang',
    unicode: '‼️',
    category: 'Symbol',
  },
  {
    alias: 'bangladesh',
    unicode: '🇧🇩',
    category: 'Country',
  },
  {
    alias: 'banjo',
    unicode: '🪕',
    category: 'Object',
  },
  {
    alias: 'bank',
    unicode: '🏦',
    category: 'Travel',
  },
  {
    alias: 'bar_chart',
    unicode: '📊',
    category: 'Object',
  },
  {
    alias: 'barbados',
    unicode: '🇧🇧',
    category: 'Country',
  },
  {
    alias: 'barber',
    unicode: '💈',
    category: 'Travel',
  },
  {
    alias: 'baseball',
    unicode: '⚾️',
    category: 'Activity',
  },
  {
    alias: 'basket',
    unicode: '🧺',
    category: 'Object',
  },
  {
    alias: 'basketball',
    unicode: '🏀',
    category: 'Activity',
  },
  {
    alias: 'basketball_man',
    unicode: '⛹',
    category: 'Activity',
  },
  {
    alias: 'basketball_woman',
    unicode: '⛹️‍♀️',
    category: 'Activity',
  },
  {
    alias: 'bat',
    unicode: '🦇',
    category: 'Animal',
  },
  {
    alias: 'bath',
    unicode: '🛀',
    category: 'Object',
  },
  {
    alias: 'bathtub',
    unicode: '🛁',
    category: 'Object',
  },
  {
    alias: 'battery',
    unicode: '🔋',
    category: 'Object',
  },
  {
    alias: 'beach_umbrella',
    unicode: '🏖',
    category: 'Travel',
  },
  {
    alias: 'bear',
    unicode: '🐻',
    category: 'Animal',
  },
  {
    alias: 'bearded_person',
    unicode: '🧔',
    category: 'Person',
  },
  {
    alias: 'beaver',
    unicode: '🦫',
    category: 'Animal',
  },
  {
    alias: 'bed',
    unicode: '🛏',
    category: 'Object',
  },
  {
    alias: ['bee', 'honeybee'],
    unicode: '🐝',
    category: 'Animal',
  },
  {
    alias: 'beer',
    unicode: '🍺',
    category: 'Food',
  },
  {
    alias: 'beers',
    unicode: '🍻',
    category: 'Food',
  },
  {
    alias: 'beetle',
    unicode: '🐞',
    category: 'Animal',
  },
  {
    alias: 'beginner',
    unicode: '🔰',
    category: 'Travel',
  },
  {
    alias: 'belarus',
    unicode: '🇧🇾',
    category: 'Country',
  },
  {
    alias: 'belgium',
    unicode: '🇧🇪',
    category: 'Country',
  },
  {
    alias: 'belize',
    unicode: '🇧🇿',
    category: 'Country',
  },
  {
    alias: 'bell',
    unicode: '🔔',
    category: 'Object',
  },
  {
    alias: 'bell_pepper',
    unicode: '🫑',
    category: 'Food',
  },
  {
    alias: 'bellhop_bell',
    unicode: '🛎',
    category: 'Object',
  },
  {
    alias: 'benin',
    unicode: '🇧🇯',
    category: 'Country',
  },
  {
    alias: 'bento',
    unicode: '🍱',
    category: 'Food',
  },
  {
    alias: 'bermuda',
    unicode: '🇧🇲',
    category: 'Country',
  },
  {
    alias: 'beverage_box',
    unicode: '🧃',
    category: 'Food',
  },
  {
    alias: 'bhutan',
    unicode: '🇧🇹',
    category: 'Country',
  },
  {
    alias: 'bike',
    unicode: '🚲',
    category: 'Travel',
  },
  {
    alias: ['biking_man', 'bicyclist'],
    unicode: '🚴',
    category: 'Activity',
  },
  {
    alias: 'biking_woman',
    unicode: '🚴‍♀',
    category: 'Activity',
  },
  {
    alias: 'bikini',
    unicode: '👙',
    category: 'Clothing',
  },
  {
    alias: 'billed_cap',
    unicode: '🧢',
    category: 'Clothing',
  },
  {
    alias: 'biohazard',
    unicode: '☣️',
    category: 'Symbol',
  },
  {
    alias: 'bird',
    unicode: '🐦',
    category: 'Animal',
  },
  {
    alias: 'birthday',
    unicode: '🎂',
    category: 'Food',
  },
  {
    alias: 'bison',
    unicode: '🦬',
    category: 'Animal',
  },
  {
    alias: 'black_cat',
    unicode: '🐈‍⬛',
    category: 'Animal',
  },
  {
    alias: 'black_circle',
    unicode: '⚫️',
    category: 'Symbol',
  },
  {
    alias: 'black_flag',
    unicode: '🏴',
    category: 'Flag',
  },
  {
    alias: 'black_heart',
    unicode: '🖤',
    category: 'Symbol',
  },
  {
    alias: 'black_joker',
    unicode: '🃏',
    category: 'Object',
  },
  {
    alias: 'black_large_square',
    unicode: '⬛️',
    category: 'Symbol',
  },
  {
    alias: 'black_medium_small_square',
    unicode: '◾️',
    category: 'Symbol',
  },
  {
    alias: 'black_medium_square',
    unicode: '◼️',
    category: 'Symbol',
  },
  {
    alias: 'black_nib',
    unicode: '✒️',
    category: 'Object',
  },
  {
    alias: 'black_small_square',
    unicode: '▪️',
    category: 'Symbol',
  },
  {
    alias: 'black_square_button',
    unicode: '🔲',
    category: 'Symbol',
  },
  {
    alias: 'blond_haired_man',
    unicode: '👱‍♂️',
    category: 'Person',
  },
  {
    alias: 'blond_haired_person',
    unicode: '👱',
    category: 'Person',
  },
  {
    alias: 'blond_haired_woman',
    unicode: '👱‍♀️',
    category: 'Person',
  },
  {
    alias: 'blonde_woman',
    unicode: '👱‍♀',
    category: 'Person',
  },
  {
    alias: 'blossom',
    unicode: '🌼',
    category: 'Nature',
  },
  {
    alias: 'blowfish',
    unicode: '🐡',
    category: 'Animal',
  },
  {
    alias: 'blue_book',
    unicode: '📘',
    category: 'Object',
  },
  {
    alias: 'blue_car',
    unicode: '🚙',
    category: 'Travel',
  },
  {
    alias: 'blue_heart',
    unicode: '💙',
    category: 'Symbol',
  },
  {
    alias: 'blue_square',
    unicode: '🟦',
    category: 'Symbol',
  },
  {
    alias: 'blueberries',
    unicode: '🫐',
    category: 'Food',
  },
  {
    alias: 'blush',
    unicode: '😊',
    category: 'Smiley',
  },
  {
    alias: 'boar',
    unicode: '🐗',
    category: 'Animal',
  },
  {
    alias: ['boat', 'sailboat'],
    unicode: '⛵️',
    category: 'Travel',
  },
  {
    alias: 'bolivia',
    unicode: '🇧🇴',
    category: 'Country',
  },
  {
    alias: 'bomb',
    unicode: '💣',
    category: 'Object',
  },
  {
    alias: 'bone',
    unicode: '🦴',
    category: 'Object',
  },
  {
    alias: ['book', 'open_book'],
    unicode: '📖',
    category: 'Object',
  },
  {
    alias: 'bookmark',
    unicode: '🔖',
    category: 'Object',
  },
  {
    alias: 'bookmark_tabs',
    unicode: '📑',
    category: 'Object',
  },
  {
    alias: 'books',
    unicode: '📚',
    category: 'Object',
  },
  {
    alias: ['boom', 'collision'],
    unicode: '💥',
    category: 'Nature',
  },
  {
    alias: 'boomerang',
    unicode: '🪃',
    category: 'Object',
  },
  {
    alias: 'boot',
    unicode: '👢',
    category: 'Object',
  },
  {
    alias: 'bosnia_herzegovina',
    unicode: '🇧🇦',
    category: 'Country',
  },
  {
    alias: 'botswana',
    unicode: '🇧🇼',
    category: 'Country',
  },
  {
    alias: 'bouncing_ball_man',
    unicode: '⛹️‍♂️',
    category: 'Person',
  },
  {
    alias: 'bouncing_ball_person',
    unicode: '⛹️',
    category: 'Person',
  },
  {
    alias: 'bouncing_ball_woman',
    unicode: '⛹️‍♀️',
    category: 'Person',
  },
  {
    alias: 'bouquet',
    unicode: '💐',
    category: 'Nature',
  },
  {
    alias: 'bouvet_island',
    unicode: '🇧🇻',
    category: 'Country',
  },
  {
    alias: 'bow_and_arrow',
    unicode: '🏹',
    category: 'Activity',
  },
  {
    alias: ['bowing_man', 'bow'],
    unicode: '🙇',
    category: 'Person',
  },
  {
    alias: 'bowing_woman',
    unicode: '🙇‍♀',
    category: 'Person',
  },
  {
    alias: 'bowl_with_spoon',
    unicode: '🥣',
    category: 'Food',
  },
  {
    alias: 'bowling',
    unicode: '🎳',
    category: 'Activity',
  },
  {
    alias: 'boxing_glove',
    unicode: '🥊',
    category: 'Activity',
  },
  {
    alias: 'boy',
    unicode: '👦',
    category: 'Person',
  },
  {
    alias: 'brain',
    unicode: '🧠',
    category: 'Person',
  },
  {
    alias: 'brazil',
    unicode: '🇧🇷',
    category: 'Country',
  },
  {
    alias: 'bread',
    unicode: '🍞',
    category: 'Food',
  },
  {
    alias: 'breast_feeding',
    unicode: '🤱',
    category: 'Person',
  },
  {
    alias: 'bricks',
    unicode: '🧱',
    category: 'Object',
  },
  {
    alias: 'bride_with_veil',
    unicode: '👰',
    category: 'Person',
  },
  {
    alias: 'bridge_at_night',
    unicode: '🌉',
    category: 'Travel',
  },
  {
    alias: 'briefcase',
    unicode: '💼',
    category: 'Object',
  },
  {
    alias: 'british_indian_ocean_territory',
    unicode: '🇮🇴',
    category: 'Country',
  },
  {
    alias: 'british_virgin_islands',
    unicode: '🇻🇬',
    category: 'Country',
  },
  {
    alias: 'broccoli',
    unicode: '🥦',
    category: 'Food',
  },
  {
    alias: 'broken_heart',
    unicode: '💔',
    category: 'Symbol',
  },
  {
    alias: 'broom',
    unicode: '🧹',
    category: 'Object',
  },
  {
    alias: 'brown_circle',
    unicode: '🟤',
    category: 'Symbol',
  },
  {
    alias: 'brown_heart',
    unicode: '🤎',
    category: 'Symbol',
  },
  {
    alias: 'brown_square',
    unicode: '🟫',
    category: 'Symbol',
  },
  {
    alias: 'brunei',
    unicode: '🇧🇳',
    category: 'Country',
  },
  {
    alias: 'bubble_tea',
    unicode: '🧋',
    category: 'Food',
  },
  {
    alias: 'bucket',
    unicode: '🪣',
    category: 'Object',
  },
  {
    alias: 'bug',
    unicode: '🐛',
    category: 'Animal',
  },
  {
    alias: 'building_construction',
    unicode: '🏗',
    category: 'Travel',
  },
  {
    alias: 'bulb',
    unicode: '💡',
    category: 'Object',
  },
  {
    alias: 'bulgaria',
    unicode: '🇧🇬',
    category: 'Country',
  },
  {
    alias: 'bullettrain_front',
    unicode: '🚅',
    category: 'Travel',
  },
  {
    alias: 'bullettrain_side',
    unicode: '🚄',
    category: 'Travel',
  },
  {
    alias: 'burkina_faso',
    unicode: '🇧🇫',
    category: 'Country',
  },
  {
    alias: 'burrito',
    unicode: '🌯',
    category: 'Food',
  },
  {
    alias: 'burundi',
    unicode: '🇧🇮',
    category: 'Country',
  },
  {
    alias: 'bus',
    unicode: '🚌',
    category: 'Travel',
  },
  {
    alias: 'business_suit_levitating',
    unicode: '🕴',
    category: 'Object',
  },
  {
    alias: 'busstop',
    unicode: '🚏',
    category: 'Travel',
  },
  {
    alias: 'bust_in_silhouette',
    unicode: '👤',
    category: 'Person',
  },
  {
    alias: 'busts_in_silhouette',
    unicode: '👥',
    category: 'Person',
  },
  {
    alias: 'butter',
    unicode: '🧈',
    category: 'Food',
  },
  {
    alias: 'butterfly',
    unicode: '🦋',
    category: 'Animal',
  },
  {
    alias: 'cactus',
    unicode: '🌵',
    category: 'Nature',
  },
  {
    alias: 'cake',
    unicode: '🍰',
    category: 'Food',
  },
  {
    alias: 'calendar',
    unicode: '📆',
    category: 'Object',
  },
  {
    alias: 'call_me_hand',
    unicode: '🤙',
    category: 'Gesture',
  },
  {
    alias: 'calling',
    unicode: '📲',
    category: 'Object',
  },
  {
    alias: 'cambodia',
    unicode: '🇰🇭',
    category: 'Country',
  },
  {
    alias: 'camel',
    unicode: '🐫',
    category: 'Animal',
  },
  {
    alias: 'camera',
    unicode: '📷',
    category: 'Object',
  },
  {
    alias: 'camera_flash',
    unicode: '📸',
    category: 'Object',
  },
  {
    alias: 'cameroon',
    unicode: '🇨🇲',
    category: 'Country',
  },
  {
    alias: 'camping',
    unicode: '🏕',
    category: 'Travel',
  },
  {
    alias: 'canada',
    unicode: '🇨🇦',
    category: 'Country',
  },
  {
    alias: 'canary_islands',
    unicode: '🇮🇨',
    category: 'Country',
  },
  {
    alias: 'cancer',
    unicode: '♋️',
    category: 'Symbol',
  },
  {
    alias: 'candle',
    unicode: '🕯',
    category: 'Object',
  },
  {
    alias: 'candy',
    unicode: '🍬',
    category: 'Food',
  },
  {
    alias: 'canned_food',
    unicode: '🥫',
    category: 'Food',
  },
  {
    alias: 'canoe',
    unicode: '🛶',
    category: 'Travel',
  },
  {
    alias: 'cape_verde',
    unicode: '🇨🇻',
    category: 'Country',
  },
  {
    alias: 'capital_abcd',
    unicode: '🔠',
    category: 'Symbol',
  },
  {
    alias: 'capricorn',
    unicode: '♑️',
    category: 'Symbol',
  },
  {
    alias: ['car', 'red_car'],
    unicode: '🚗',
    category: 'Travel',
  },
  {
    alias: 'card_file_box',
    unicode: '🗃',
    category: 'Object',
  },
  {
    alias: 'card_index',
    unicode: '📇',
    category: 'Object',
  },
  {
    alias: 'card_index_dividers',
    unicode: '🗂',
    category: 'Object',
  },
  {
    alias: 'caribbean_netherlands',
    unicode: '🇧🇶',
    category: 'Country',
  },
  {
    alias: 'carousel_horse',
    unicode: '🎠',
    category: 'Travel',
  },
  {
    alias: 'carpentry_saw',
    unicode: '🪚',
    category: 'Object',
  },
  {
    alias: 'carrot',
    unicode: '🥕',
    category: 'Food',
  },
  {
    alias: 'cartwheeling',
    unicode: '🤸',
    category: 'Activity',
  },
  {
    alias: 'cat',
    unicode: '🐱',
    category: 'Animal',
  },
  {
    alias: 'cat2',
    unicode: '🐈',
    category: 'Animal',
  },
  {
    alias: 'cayman_islands',
    unicode: '🇰🇾',
    category: 'Country',
  },
  {
    alias: 'cd',
    unicode: '💿',
    category: 'Object',
  },
  {
    alias: 'central_african_republic',
    unicode: '🇨🇫',
    category: 'Country',
  },
  {
    alias: 'ceuta_melilla',
    unicode: '🇪🇦',
    category: 'Country',
  },
  {
    alias: 'chad',
    unicode: '🇹🇩',
    category: 'Country',
  },
  {
    alias: 'chains',
    unicode: '⛓',
    category: 'Object',
  },
  {
    alias: 'chair',
    unicode: '🪑',
    category: 'Object',
  },
  {
    alias: 'champagne',
    unicode: '🍾',
    category: 'Food',
  },
  {
    alias: 'chart',
    unicode: '💹',
    category: 'Symbol',
  },
  {
    alias: 'chart_with_downwards_trend',
    unicode: '📉',
    category: 'Object',
  },
  {
    alias: 'chart_with_upwards_trend',
    unicode: '📈',
    category: 'Object',
  },
  {
    alias: 'checkered_flag',
    unicode: '🏁',
    category: 'Flag',
  },
  {
    alias: 'cheese',
    unicode: '🧀',
    category: 'Food',
  },
  {
    alias: 'cherries',
    unicode: '🍒',
    category: 'Food',
  },
  {
    alias: 'cherry_blossom',
    unicode: '🌸',
    category: 'Nature',
  },
  {
    alias: 'chess_pawn',
    unicode: '♟️',
    category: 'Activity',
  },
  {
    alias: 'chestnut',
    unicode: '🌰',
    category: 'Nature',
  },
  {
    alias: 'chicken',
    unicode: '🐔',
    category: 'Animal',
  },
  {
    alias: 'child',
    unicode: '🧒',
    category: 'Person',
  },
  {
    alias: 'children_crossing',
    unicode: '🚸',
    category: 'Symbol',
  },
  {
    alias: 'chile',
    unicode: '🇨🇱',
    category: 'Country',
  },
  {
    alias: 'chipmunk',
    unicode: '🐿',
    category: 'Animal',
  },
  {
    alias: 'chocolate_bar',
    unicode: '🍫',
    category: 'Food',
  },
  {
    alias: 'chopsticks',
    unicode: '🥢',
    category: 'Food',
  },
  {
    alias: 'christmas_island',
    unicode: '🇨🇽',
    category: 'Country',
  },
  {
    alias: 'christmas_tree',
    unicode: '🎄',
    category: 'Object',
  },
  {
    alias: 'church',
    unicode: '⛪️',
    category: 'Travel',
  },
  {
    alias: 'cinema',
    unicode: '🎦',
    category: 'Symbol',
  },
  {
    alias: 'circus_tent',
    unicode: '🎪',
    category: 'Activity',
  },
  {
    alias: 'city_sunrise',
    unicode: '🌇',
    category: 'Travel',
  },
  {
    alias: 'city_sunset',
    unicode: '🌆',
    category: 'Travel',
  },
  {
    alias: 'cityscape',
    unicode: '🏙',
    category: 'Travel',
  },
  {
    alias: 'cl',
    unicode: '🆑',
    category: 'Symbol',
  },
  {
    alias: 'clamp',
    unicode: '🗜',
    category: 'Object',
  },
  {
    alias: 'clap',
    unicode: '👏',
    category: 'Gesture',
  },
  {
    alias: 'clapper',
    unicode: '🎬',
    category: 'Activity',
  },
  {
    alias: 'classical_building',
    unicode: '🏛',
    category: 'Travel',
  },
  {
    alias: 'climbing',
    unicode: '🧗',
    category: 'Person',
  },
  {
    alias: 'climbing_man',
    unicode: '🧗‍♂️',
    category: 'Person',
  },
  {
    alias: 'climbing_woman',
    unicode: '🧗‍♀️',
    category: 'Person',
  },
  {
    alias: 'clinking_glasses',
    unicode: '🥂',
    category: 'Food',
  },
  {
    alias: 'clipboard',
    unicode: '📋',
    category: 'Object',
  },
  {
    alias: 'clipperton_island',
    unicode: '🇨🇵',
    category: 'Country',
  },
  {
    alias: 'clock1',
    unicode: '🕐',
    category: 'Symbol',
  },
  {
    alias: 'clock10',
    unicode: '🕙',
    category: 'Symbol',
  },
  {
    alias: 'clock1030',
    unicode: '🕥',
    category: 'Symbol',
  },
  {
    alias: 'clock11',
    unicode: '🕚',
    category: 'Symbol',
  },
  {
    alias: 'clock1130',
    unicode: '🕦',
    category: 'Symbol',
  },
  {
    alias: 'clock12',
    unicode: '🕛',
    category: 'Symbol',
  },
  {
    alias: 'clock1230',
    unicode: '🕧',
    category: 'Symbol',
  },
  {
    alias: 'clock130',
    unicode: '🕜',
    category: 'Symbol',
  },
  {
    alias: 'clock2',
    unicode: '🕑',
    category: 'Symbol',
  },
  {
    alias: 'clock230',
    unicode: '🕝',
    category: 'Symbol',
  },
  {
    alias: 'clock3',
    unicode: '🕒',
    category: 'Symbol',
  },
  {
    alias: 'clock330',
    unicode: '🕞',
    category: 'Symbol',
  },
  {
    alias: 'clock4',
    unicode: '🕓',
    category: 'Symbol',
  },
  {
    alias: 'clock430',
    unicode: '🕟',
    category: 'Symbol',
  },
  {
    alias: 'clock5',
    unicode: '🕔',
    category: 'Symbol',
  },
  {
    alias: 'clock530',
    unicode: '🕠',
    category: 'Symbol',
  },
  {
    alias: 'clock6',
    unicode: '🕕',
    category: 'Symbol',
  },
  {
    alias: 'clock630',
    unicode: '🕡',
    category: 'Symbol',
  },
  {
    alias: 'clock7',
    unicode: '🕖',
    category: 'Symbol',
  },
  {
    alias: 'clock730',
    unicode: '🕢',
    category: 'Symbol',
  },
  {
    alias: 'clock8',
    unicode: '🕗',
    category: 'Symbol',
  },
  {
    alias: 'clock830',
    unicode: '🕣',
    category: 'Symbol',
  },
  {
    alias: 'clock9',
    unicode: '🕘',
    category: 'Symbol',
  },
  {
    alias: 'clock930',
    unicode: '🕤',
    category: 'Symbol',
  },
  {
    alias: 'closed_book',
    unicode: '📕',
    category: 'Object',
  },
  {
    alias: 'closed_lock_with_key',
    unicode: '🔐',
    category: 'Object',
  },
  {
    alias: 'closed_umbrella',
    unicode: '🌂',
    category: 'Object',
  },
  {
    alias: 'cloud',
    unicode: '☁️',
    category: 'Nature',
  },
  {
    alias: 'cloud_with_lightning',
    unicode: '🌩',
    category: 'Nature',
  },
  {
    alias: 'cloud_with_lightning_and_rain',
    unicode: '⛈',
    category: 'Nature',
  },
  {
    alias: 'cloud_with_rain',
    unicode: '🌧',
    category: 'Nature',
  },
  {
    alias: 'cloud_with_snow',
    unicode: '🌨',
    category: 'Nature',
  },
  {
    alias: 'clown_face',
    unicode: '🤡',
    category: 'Smiley',
  },
  {
    alias: 'clubs',
    unicode: '♣️',
    category: 'Symbol',
  },
  {
    alias: 'cn',
    unicode: '🇨🇳',
    category: 'Country',
  },
  {
    alias: 'coat',
    unicode: '🧥',
    category: 'Clothing',
  },
  {
    alias: 'cockroach',
    unicode: '🪳',
    category: 'Animal',
  },
  {
    alias: 'cocktail',
    unicode: '🍸',
    category: 'Food',
  },
  {
    alias: 'coconut',
    unicode: '🥥',
    category: 'Food',
  },
  {
    alias: 'cocos_islands',
    unicode: '🇨🇨',
    category: 'Country',
  },
  {
    alias: 'coffee',
    unicode: '☕️',
    category: 'Food',
  },
  {
    alias: 'coffin',
    unicode: '⚰️',
    category: 'Object',
  },
  {
    alias: 'coin',
    unicode: '🪙',
    category: 'Object',
  },
  {
    alias: 'cold_face',
    unicode: '🥶',
    category: 'Smiley',
  },
  {
    alias: 'cold_sweat',
    unicode: '😰',
    category: 'Smiley',
  },
  {
    alias: 'colombia',
    unicode: '🇨🇴',
    category: 'Country',
  },
  {
    alias: 'comet',
    unicode: '☄',
    category: 'Nature',
  },
  {
    alias: 'comoros',
    unicode: '🇰🇲',
    category: 'Country',
  },
  {
    alias: 'compass',
    unicode: '🧭',
    category: 'Object',
  },
  {
    alias: 'computer',
    unicode: '💻',
    category: 'Object',
  },
  {
    alias: 'computer_mouse',
    unicode: '🖱',
    category: 'Object',
  },
  {
    alias: 'confetti_ball',
    unicode: '🎊',
    category: 'Object',
  },
  {
    alias: 'confounded',
    unicode: '😖',
    category: 'Smiley',
  },
  {
    alias: 'confused',
    unicode: '😕',
    category: 'Smiley',
  },
  {
    alias: 'congo_brazzaville',
    unicode: '🇨🇬',
    category: 'Country',
  },
  {
    alias: 'congo_kinshasa',
    unicode: '🇨🇩',
    category: 'Country',
  },
  {
    alias: 'congratulations',
    unicode: '㊗️',
    category: 'Symbol',
  },
  {
    alias: 'construction',
    unicode: '🚧',
    category: 'Travel',
  },
  {
    alias: ['construction_worker_man', 'construction_worker'],
    unicode: '👷',
    category: 'Person',
  },
  {
    alias: 'construction_worker_woman',
    unicode: '👷‍♀',
    category: 'Person',
  },
  {
    alias: 'control_knobs',
    unicode: '🎛',
    category: 'Object',
  },
  {
    alias: 'convenience_store',
    unicode: '🏪',
    category: 'Travel',
  },
  {
    alias: 'cook',
    unicode: '🧑‍🍳',
    category: 'Person',
  },
  {
    alias: 'cook_islands',
    unicode: '🇨🇰',
    category: 'Country',
  },
  {
    alias: 'cookie',
    unicode: '🍪',
    category: 'Food',
  },
  {
    alias: 'cool',
    unicode: '🆒',
    category: 'Symbol',
  },
  {
    alias: 'copyright',
    unicode: '©️',
    category: 'Symbol',
  },
  {
    alias: 'corn',
    unicode: '🌽',
    category: 'Food',
  },
  {
    alias: 'costa_rica',
    unicode: '🇨🇷',
    category: 'Country',
  },
  {
    alias: 'cote_divoire',
    unicode: '🇨🇮',
    category: 'Country',
  },
  {
    alias: 'couch_and_lamp',
    unicode: '🛋',
    category: 'Object',
  },
  {
    alias: 'couple',
    unicode: '👫',
    category: 'Person',
  },
  {
    alias: 'couple_with_heart_man_man',
    unicode: '👨‍❤️‍👨',
    category: 'Person',
  },
  {
    alias: ['couple_with_heart_woman_man', 'couple_with_heart'],
    unicode: '💑',
    category: 'Person',
  },
  {
    alias: 'couple_with_heart_woman_woman',
    unicode: '👩‍❤️‍👩',
    category: 'Person',
  },
  {
    alias: 'couplekiss',
    unicode: '💏',
    category: 'Person',
  },
  {
    alias: 'couplekiss_man_man',
    unicode: '👨‍❤️‍💋‍👨',
    category: 'Person',
  },
  {
    alias: 'couplekiss_man_woman',
    unicode: '💏',
    category: 'Person',
  },
  {
    alias: 'couplekiss_woman_woman',
    unicode: '👩‍❤️‍💋‍👩',
    category: 'Person',
  },
  {
    alias: 'cow',
    unicode: '🐮',
    category: 'Animal',
  },
  {
    alias: 'cow2',
    unicode: '🐄',
    category: 'Animal',
  },
  {
    alias: 'cowboy_hat_face',
    unicode: '🤠',
    category: 'Person',
  },
  {
    alias: 'crab',
    unicode: '🦀',
    category: 'Animal',
  },
  {
    alias: 'crayon',
    unicode: '🖍',
    category: 'Object',
  },
  {
    alias: 'credit_card',
    unicode: '💳',
    category: 'Object',
  },
  {
    alias: 'crescent_moon',
    unicode: '🌙',
    category: 'Nature',
  },
  {
    alias: 'cricket',
    unicode: '🦗',
    category: 'Animal',
  },
  {
    alias: 'cricket_game',
    unicode: '🏏',
    category: 'Activity',
  },
  {
    alias: 'croatia',
    unicode: '🇭🇷',
    category: 'Country',
  },
  {
    alias: 'crocodile',
    unicode: '🐊',
    category: 'Animal',
  },
  {
    alias: 'croissant',
    unicode: '🥐',
    category: 'Food',
  },
  {
    alias: 'crossed_fingers',
    unicode: '🤞',
    category: 'Gesture',
  },
  {
    alias: 'crossed_flags',
    unicode: '🎌',
    category: 'Flag',
  },
  {
    alias: 'crossed_swords',
    unicode: '⚔️',
    category: 'Object',
  },
  {
    alias: 'crown',
    unicode: '👑',
    category: 'Object',
  },
  {
    alias: 'cry',
    unicode: '😢',
    category: 'Smiley',
  },
  {
    alias: 'crying_cat_face',
    unicode: '😿',
    category: 'Smiley',
  },
  {
    alias: 'crystal_ball',
    unicode: '🔮',
    category: 'Object',
  },
  {
    alias: 'cuba',
    unicode: '🇨🇺',
    category: 'Country',
  },
  {
    alias: 'cucumber',
    unicode: '🥒',
    category: 'Food',
  },
  {
    alias: 'cup_with_straw',
    unicode: '🥤',
    category: 'Food',
  },
  {
    alias: 'cupcake',
    unicode: '🧁',
    category: 'Food',
  },
  {
    alias: 'cupid',
    unicode: '💘',
    category: 'Symbol',
  },
  {
    alias: 'curacao',
    unicode: '🇨🇼',
    category: 'Country',
  },
  {
    alias: 'curling_stone',
    unicode: '🥌',
    category: 'Activity',
  },
  {
    alias: 'curly_haired_man',
    unicode: '👨‍🦱',
    category: 'Person',
  },
  {
    alias: 'curly_haired_woman',
    unicode: '👩‍🦱',
    category: 'Person',
  },
  {
    alias: 'curly_loop',
    unicode: '➰',
    category: 'Symbol',
  },
  {
    alias: 'currency_exchange',
    unicode: '💱',
    category: 'Symbol',
  },
  {
    alias: 'curry',
    unicode: '🍛',
    category: 'Food',
  },
  {
    alias: 'cursing_face',
    unicode: '🤬',
    category: 'Smiley',
  },
  {
    alias: 'custard',
    unicode: '🍮',
    category: 'Food',
  },
  {
    alias: 'customs',
    unicode: '🛃',
    category: 'Symbol',
  },
  {
    alias: 'cut_of_meat',
    unicode: '🥩',
    category: 'Food',
  },
  {
    alias: 'cyclone',
    unicode: '🌀',
    category: 'Nature',
  },
  {
    alias: 'cyprus',
    unicode: '🇨🇾',
    category: 'Country',
  },
  {
    alias: 'czech_republic',
    unicode: '🇨🇿',
    category: 'Country',
  },
  {
    alias: 'dagger',
    unicode: '🗡',
    category: 'Object',
  },
  {
    alias: 'dancer',
    unicode: '💃',
    category: 'Person',
  },
  {
    alias: 'dancing_men',
    unicode: '👯‍♂',
    category: 'Person',
  },
  {
    alias: ['dancing_women', 'dancers'],
    unicode: '👯',
    category: 'Person',
  },
  {
    alias: 'dango',
    unicode: '🍡',
    category: 'Food',
  },
  {
    alias: 'dark_sunglasses',
    unicode: '🕶',
    category: 'Object',
  },
  {
    alias: 'dart',
    unicode: '🎯',
    category: 'Object',
  },
  {
    alias: 'dash',
    unicode: '💨',
    category: 'Nature',
  },
  {
    alias: 'date',
    unicode: '📅',
    category: 'Object',
  },
  {
    alias: 'de',
    unicode: '🇩🇪',
    category: 'Country',
  },
  {
    alias: 'deaf_man',
    unicode: '🧏‍♂️',
    category: 'Person',
  },
  {
    alias: 'deaf_person',
    unicode: '🧏',
    category: 'Person',
  },
  {
    alias: 'deaf_woman',
    unicode: '🧏‍♀️',
    category: 'Person',
  },
  {
    alias: 'deciduous_tree',
    unicode: '🌳',
    category: 'Nature',
  },
  {
    alias: 'deer',
    unicode: '🦌',
    category: 'Animal',
  },
  {
    alias: 'denmark',
    unicode: '🇩🇰',
    category: 'Country',
  },
  {
    alias: 'department_store',
    unicode: '🏬',
    category: 'Travel',
  },
  {
    alias: 'derelict_house',
    unicode: '🏚',
    category: 'Travel',
  },
  {
    alias: 'desert',
    unicode: '🏜',
    category: 'Travel',
  },
  {
    alias: 'desert_island',
    unicode: '🏝',
    category: 'Travel',
  },
  {
    alias: 'desktop_computer',
    unicode: '🖥',
    category: 'Object',
  },
  {
    alias: 'diamond_shape_with_a_dot_inside',
    unicode: '💠',
    category: 'Symbol',
  },
  {
    alias: 'diamonds',
    unicode: '♦️',
    category: 'Symbol',
  },
  {
    alias: 'diego_garcia',
    unicode: '🇩🇬',
    category: 'Country',
  },
  {
    alias: 'disappointed',
    unicode: '😞',
    category: 'Smiley',
  },
  {
    alias: 'disappointed_relieved',
    unicode: '😥',
    category: 'Smiley',
  },
  {
    alias: 'disguised_face',
    unicode: '🥸',
    category: 'Smiley',
  },
  {
    alias: 'diving_mask',
    unicode: '🤿',
    category: 'Activity',
  },
  {
    alias: 'diya_lamp',
    unicode: '🪔',
    category: 'Object',
  },
  {
    alias: 'dizzy',
    unicode: '💫',
    category: 'Nature',
  },
  {
    alias: 'dizzy_face',
    unicode: '😵',
    category: 'Smiley',
  },
  {
    alias: 'djibouti',
    unicode: '🇩🇯',
    category: 'Country',
  },
  {
    alias: 'dna',
    unicode: '🧬',
    category: 'Object',
  },
  {
    alias: 'do_not_litter',
    unicode: '🚯',
    category: 'Symbol',
  },
  {
    alias: 'dodo',
    unicode: '🦤',
    category: 'Animal',
  },
  {
    alias: 'dog',
    unicode: '🐶',
    category: 'Animal',
  },
  {
    alias: 'dog2',
    unicode: '🐕',
    category: 'Animal',
  },
  {
    alias: 'dollar',
    unicode: '💵',
    category: 'Object',
  },
  {
    alias: 'dolls',
    unicode: '🎎',
    category: 'Object',
  },
  {
    alias: ['dolphin', 'flipper'],
    unicode: '🐬',
    category: 'Animal',
  },
  {
    alias: 'dominica',
    unicode: '🇩🇲',
    category: 'Country',
  },
  {
    alias: 'dominican_republic',
    unicode: '🇩🇴',
    category: 'Country',
  },
  {
    alias: 'door',
    unicode: '🚪',
    category: 'Object',
  },
  {
    alias: 'doughnut',
    unicode: '🍩',
    category: 'Food',
  },
  {
    alias: 'dove',
    unicode: '🕊',
    category: 'Animal',
  },
  {
    alias: 'dragon',
    unicode: '🐉',
    category: 'Animal',
  },
  {
    alias: 'dragon_face',
    unicode: '🐲',
    category: 'Animal',
  },
  {
    alias: 'dress',
    unicode: '👗',
    category: 'Object',
  },
  {
    alias: 'dromedary_camel',
    unicode: '🐪',
    category: 'Animal',
  },
  {
    alias: 'drooling_face',
    unicode: '🤤',
    category: 'Smiley',
  },
  {
    alias: 'drop_of_blood',
    unicode: '🩸',
    category: 'Object',
  },
  {
    alias: 'droplet',
    unicode: '💧',
    category: 'Nature',
  },
  {
    alias: 'drum',
    unicode: '🥁',
    category: 'Activity',
  },
  {
    alias: 'duck',
    unicode: '🦆',
    category: 'Animal',
  },
  {
    alias: 'dumpling',
    unicode: '🥟',
    category: 'Food',
  },
  {
    alias: 'dvd',
    unicode: '📀',
    category: 'Object',
  },
  {
    alias: 'e-mail',
    unicode: '📧',
    category: 'Object',
  },
  {
    alias: 'eagle',
    unicode: '🦅',
    category: 'Animal',
  },
  {
    alias: 'ear',
    unicode: '👂',
    category: 'Person',
  },
  {
    alias: 'ear_of_rice',
    unicode: '🌾',
    category: 'Nature',
  },
  {
    alias: 'ear_with_hearing_aid',
    unicode: '🦻',
    category: 'Person',
  },
  {
    alias: 'earth_africa',
    unicode: '🌍',
    category: 'Nature',
  },
  {
    alias: 'earth_americas',
    unicode: '🌎',
    category: 'Nature',
  },
  {
    alias: 'earth_asia',
    unicode: '🌏',
    category: 'Nature',
  },
  {
    alias: 'ecuador',
    unicode: '🇪🇨',
    category: 'Country',
  },
  {
    alias: 'egg',
    unicode: '🥚',
    category: 'Food',
  },
  {
    alias: 'eggplant',
    unicode: '🍆',
    category: 'Food',
  },
  {
    alias: 'egypt',
    unicode: '🇪🇬',
    category: 'Country',
  },
  {
    alias: 'eight',
    unicode: '8️⃣',
    category: 'Symbol',
  },
  {
    alias: 'eight_pointed_black_star',
    unicode: '✴️',
    category: 'Symbol',
  },
  {
    alias: 'eight_spoked_asterisk',
    unicode: '✳️',
    category: 'Symbol',
  },
  {
    alias: 'eject_button',
    unicode: '⏏️',
    category: 'Symbol',
  },
  {
    alias: 'el_salvador',
    unicode: '🇸🇻',
    category: 'Country',
  },
  {
    alias: 'electric_plug',
    unicode: '🔌',
    category: 'Object',
  },
  {
    alias: 'elephant',
    unicode: '🐘',
    category: 'Animal',
  },
  {
    alias: 'elevator',
    unicode: '🛗',
    category: 'Symbol',
  },
  {
    alias: 'elf',
    unicode: '🧝',
    category: 'Person',
  },
  {
    alias: 'elf_man',
    unicode: '🧝‍♂️',
    category: 'Person',
  },
  {
    alias: 'elf_woman',
    unicode: '🧝‍♀️',
    category: 'Person',
  },
  {
    alias: ['email', 'envelope'],
    unicode: '✉️',
    category: 'Object',
  },
  {
    alias: 'end',
    unicode: '🔚',
    category: 'Symbol',
  },
  {
    alias: 'england',
    unicode: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    category: 'Country',
  },
  {
    alias: 'envelope_with_arrow',
    unicode: '📩',
    category: 'Object',
  },
  {
    alias: 'equatorial_guinea',
    unicode: '🇬🇶',
    category: 'Country',
  },
  {
    alias: 'eritrea',
    unicode: '🇪🇷',
    category: 'Country',
  },
  {
    alias: 'es',
    unicode: '🇪🇸',
    category: 'Country',
  },
  {
    alias: 'estonia',
    unicode: '🇪🇪',
    category: 'Country',
  },
  {
    alias: 'ethiopia',
    unicode: '🇪🇹',
    category: 'Country',
  },
  {
    alias: ['eu', 'european_union'],
    unicode: '🇪🇺',
    category: 'Country',
  },
  {
    alias: 'euro',
    unicode: '💶',
    category: 'Object',
  },
  {
    alias: 'european_castle',
    unicode: '🏰',
    category: 'Travel',
  },
  {
    alias: 'european_post_office',
    unicode: '🏤',
    category: 'Travel',
  },
  {
    alias: 'evergreen_tree',
    unicode: '🌲',
    category: 'Nature',
  },
  {
    alias: ['exclamation', 'heavy_exclamation_mark'],
    unicode: '❗️',
    category: 'Symbol',
  },
  {
    alias: 'exploding_head',
    unicode: '🤯',
    category: 'Smiley',
  },
  {
    alias: 'expressionless',
    unicode: '😑',
    category: 'Smiley',
  },
  {
    alias: 'eye',
    unicode: '👁',
    category: 'Person',
  },
  {
    alias: 'eye_speech_bubble',
    unicode: '👁‍🗨',
    category: 'Symbol',
  },
  {
    alias: 'eyeglasses',
    unicode: '👓',
    category: 'Object',
  },
  {
    alias: 'eyes',
    unicode: '👀',
    category: 'Person',
  },
  {
    alias: 'face_exhaling',
    unicode: '😮‍💨',
    category: 'Smiley',
  },
  {
    alias: 'face_in_clouds',
    unicode: '😶‍🌫️',
    category: 'Smiley',
  },
  {
    alias: 'face_with_head_bandage',
    unicode: '🤕',
    category: 'Smiley',
  },
  {
    alias: 'face_with_spiral_eyes',
    unicode: '😵‍💫',
    category: 'Smiley',
  },
  {
    alias: 'face_with_thermometer',
    unicode: '🤒',
    category: 'Smiley',
  },
  {
    alias: 'facepalm',
    unicode: '🤦',
    category: 'Person',
  },
  {
    alias: 'factory',
    unicode: '🏭',
    category: 'Travel',
  },
  {
    alias: 'factory_worker',
    unicode: '🧑‍🏭',
    category: 'Person',
  },
  {
    alias: 'fairy',
    unicode: '🧚',
    category: 'Person',
  },
  {
    alias: 'fairy_man',
    unicode: '🧚‍♂️',
    category: 'Person',
  },
  {
    alias: 'fairy_woman',
    unicode: '🧚‍♀️',
    category: 'Person',
  },
  {
    alias: 'falafel',
    unicode: '🧆',
    category: 'Food',
  },
  {
    alias: 'falkland_islands',
    unicode: '🇫🇰',
    category: 'Country',
  },
  {
    alias: 'fallen_leaf',
    unicode: '🍂',
    category: 'Nature',
  },
  {
    alias: 'family_man_boy',
    unicode: '👨‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_boy_boy',
    unicode: '👨‍👦‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_girl',
    unicode: '👨‍👧',
    category: 'Person',
  },
  {
    alias: 'family_man_girl_boy',
    unicode: '👨‍👧‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_girl_girl',
    unicode: '👨‍👧‍👧',
    category: 'Person',
  },
  {
    alias: 'family_man_man_boy',
    unicode: '👨‍👨‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_man_boy_boy',
    unicode: '👨‍👨‍👦‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_man_girl',
    unicode: '👨‍👨‍👧',
    category: 'Person',
  },
  {
    alias: 'family_man_man_girl_boy',
    unicode: '👨‍👨‍👧‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_man_girl_girl',
    unicode: '👨‍👨‍👧‍👧',
    category: 'Person',
  },
  {
    alias: ['family_man_woman_boy', 'family'],
    unicode: '👪',
    category: 'Person',
  },
  {
    alias: 'family_man_woman_boy_boy',
    unicode: '👨‍👩‍👦‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_woman_girl',
    unicode: '👨‍👩‍👧',
    category: 'Person',
  },
  {
    alias: 'family_man_woman_girl_boy',
    unicode: '👨‍👩‍👧‍👦',
    category: 'Person',
  },
  {
    alias: 'family_man_woman_girl_girl',
    unicode: '👨‍👩‍👧‍👧',
    category: 'Person',
  },
  {
    alias: 'family_woman_boy',
    unicode: '👩‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_boy_boy',
    unicode: '👩‍👦‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_girl',
    unicode: '👩‍👧',
    category: 'Person',
  },
  {
    alias: 'family_woman_girl_boy',
    unicode: '👩‍👧‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_girl_girl',
    unicode: '👩‍👧‍👧',
    category: 'Person',
  },
  {
    alias: 'family_woman_woman_boy',
    unicode: '👩‍👩‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_woman_boy_boy',
    unicode: '👩‍👩‍👦‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_woman_girl',
    unicode: '👩‍👩‍👧',
    category: 'Person',
  },
  {
    alias: 'family_woman_woman_girl_boy',
    unicode: '👩‍👩‍👧‍👦',
    category: 'Person',
  },
  {
    alias: 'family_woman_woman_girl_girl',
    unicode: '👩‍👩‍👧‍👧',
    category: 'Person',
  },
  {
    alias: 'farmer',
    unicode: '🧑‍🌾',
    category: 'Person',
  },
  {
    alias: 'faroe_islands',
    unicode: '🇫🇴',
    category: 'Country',
  },
  {
    alias: 'fast_forward',
    unicode: '⏩',
    category: 'Symbol',
  },
  {
    alias: 'fax',
    unicode: '📠',
    category: 'Object',
  },
  {
    alias: 'fearful',
    unicode: '😨',
    category: 'Smiley',
  },
  {
    alias: 'feather',
    unicode: '🪶',
    category: 'Nature',
  },
  {
    alias: ['feet', 'paw_prints'],
    unicode: '🐾',
    category: 'Animal',
  },
  {
    alias: 'female_detective',
    unicode: '🕵️‍♀️',
    category: 'Person',
  },
  {
    alias: 'female_sign',
    unicode: '♀️',
    category: 'Symbol',
  },
  {
    alias: 'ferris_wheel',
    unicode: '🎡',
    category: 'Travel',
  },
  {
    alias: 'ferry',
    unicode: '⛴',
    category: 'Travel',
  },
  {
    alias: 'field_hockey',
    unicode: '🏑',
    category: 'Activity',
  },
  {
    alias: 'fiji',
    unicode: '🇫🇯',
    category: 'Country',
  },
  {
    alias: 'file_cabinet',
    unicode: '🗄',
    category: 'Object',
  },
  {
    alias: 'file_folder',
    unicode: '📁',
    category: 'Object',
  },
  {
    alias: 'film_projector',
    unicode: '📽',
    category: 'Object',
  },
  {
    alias: 'film_strip',
    unicode: '🎞',
    category: 'Object',
  },
  {
    alias: 'finland',
    unicode: '🇫🇮',
    category: 'Country',
  },
  {
    alias: 'fire',
    unicode: '🔥',
    category: 'Nature',
  },
  {
    alias: 'fire_engine',
    unicode: '🚒',
    category: 'Travel',
  },
  {
    alias: 'fire_extinguisher',
    unicode: '🧯',
    category: 'Object',
  },
  {
    alias: 'firecracker',
    unicode: '🧨',
    category: 'Object',
  },
  {
    alias: 'firefighter',
    unicode: '🧑‍🚒',
    category: 'Person',
  },
  {
    alias: 'fireworks',
    unicode: '🎆',
    category: 'Object',
  },
  {
    alias: 'first_quarter_moon',
    unicode: '🌓',
    category: 'Nature',
  },
  {
    alias: 'first_quarter_moon_with_face',
    unicode: '🌛',
    category: 'Nature',
  },
  {
    alias: 'fish',
    unicode: '🐟',
    category: 'Animal',
  },
  {
    alias: 'fish_cake',
    unicode: '🍥',
    category: 'Food',
  },
  {
    alias: 'fishing_pole_and_fish',
    unicode: '🎣',
    category: 'Activity',
  },
  {
    alias: 'fist_left',
    unicode: '🤛',
    category: 'Gesture',
  },
  {
    alias: ['fist_oncoming', 'facepunch', 'punch'],
    unicode: '👊',
    category: 'Gesture',
  },
  {
    alias: ['fist_raised', 'fist'],
    unicode: '✊',
    category: 'Gesture',
  },
  {
    alias: 'fist_right',
    unicode: '🤜',
    category: 'Gesture',
  },
  {
    alias: 'five',
    unicode: '5️⃣',
    category: 'Symbol',
  },
  {
    alias: 'flags',
    unicode: '🎏',
    category: 'Object',
  },
  {
    alias: 'flamingo',
    unicode: '🦩',
    category: 'Food',
  },
  {
    alias: 'flashlight',
    unicode: '🔦',
    category: 'Object',
  },
  {
    alias: 'flat_shoe',
    unicode: '🥿',
    category: 'Clothing',
  },
  {
    alias: 'flatbread',
    unicode: '🫓',
    category: 'Food',
  },
  {
    alias: 'fleur_de_lis',
    unicode: '⚜️',
    category: 'Symbol',
  },
  {
    alias: 'flight_arrival',
    unicode: '🛬',
    category: 'Travel',
  },
  {
    alias: 'flight_departure',
    unicode: '🛫',
    category: 'Travel',
  },
  {
    alias: 'floppy_disk',
    unicode: '💾',
    category: 'Object',
  },
  {
    alias: 'flower_playing_cards',
    unicode: '🎴',
    category: 'Object',
  },
  {
    alias: 'flushed',
    unicode: '😳',
    category: 'Smiley',
  },
  {
    alias: 'fly',
    unicode: '🪰',
    category: 'Animal',
  },
  {
    alias: 'flying_disc',
    unicode: '🥏',
    category: 'Activity',
  },
  {
    alias: 'flying_saucer',
    unicode: '🛸',
    category: 'Object',
  },
  {
    alias: 'fog',
    unicode: '🌫',
    category: 'Nature',
  },
  {
    alias: 'foggy',
    unicode: '🌁',
    category: 'Nature',
  },
  {
    alias: 'fondue',
    unicode: '🫕',
    category: 'Food',
  },
  {
    alias: 'foot',
    unicode: '🦶',
    category: 'Person',
  },
  {
    alias: 'football',
    unicode: '🏈',
    category: 'Activity',
  },
  {
    alias: 'footprints',
    unicode: '👣',
    category: 'Person',
  },
  {
    alias: 'fork_and_knife',
    unicode: '🍴',
    category: 'Food',
  },
  {
    alias: 'fortune_cookie',
    unicode: '🥠',
    category: 'Food',
  },
  {
    alias: 'fountain',
    unicode: '⛲️',
    category: 'Travel',
  },
  {
    alias: 'fountain_pen',
    unicode: '🖋',
    category: 'Object',
  },
  {
    alias: 'four',
    unicode: '4️⃣',
    category: 'Symbol',
  },
  {
    alias: 'four_leaf_clover',
    unicode: '🍀',
    category: 'Nature',
  },
  {
    alias: 'fox_face',
    unicode: '🦊',
    category: 'Animal',
  },
  {
    alias: 'fr',
    unicode: '🇫🇷',
    category: 'Country',
  },
  {
    alias: 'framed_picture',
    unicode: '🖼',
    category: 'Object',
  },
  {
    alias: 'free',
    unicode: '🆓',
    category: 'Symbol',
  },
  {
    alias: 'french_guiana',
    unicode: '🇬🇫',
    category: 'Country',
  },
  {
    alias: 'french_polynesia',
    unicode: '🇵🇫',
    category: 'Country',
  },
  {
    alias: 'french_southern_territories',
    unicode: '🇹🇫',
    category: 'Country',
  },
  {
    alias: 'fried_egg',
    unicode: '🍳',
    category: 'Food',
  },
  {
    alias: 'fried_shrimp',
    unicode: '🍤',
    category: 'Food',
  },
  {
    alias: 'fries',
    unicode: '🍟',
    category: 'Food',
  },
  {
    alias: 'frog',
    unicode: '🐸',
    category: 'Animal',
  },
  {
    alias: 'frowning',
    unicode: '😦',
    category: 'Smiley',
  },
  {
    alias: 'frowning_face',
    unicode: '☹️',
    category: 'Smiley',
  },
  {
    alias: 'frowning_man',
    unicode: '🙍‍♂',
    category: 'Person',
  },
  {
    alias: 'frowning_person',
    unicode: '🙍',
    category: 'Person',
  },
  {
    alias: 'frowning_woman',
    unicode: '🙍',
    category: 'Person',
  },
  {
    alias: 'fuelpump',
    unicode: '⛽️',
    category: 'Travel',
  },
  {
    alias: 'full_moon',
    unicode: '🌕',
    category: 'Nature',
  },
  {
    alias: 'full_moon_with_face',
    unicode: '🌝',
    category: 'Nature',
  },
  {
    alias: 'funeral_urn',
    unicode: '⚱️',
    category: 'Object',
  },
  {
    alias: 'gabon',
    unicode: '🇬🇦',
    category: 'Country',
  },
  {
    alias: 'gambia',
    unicode: '🇬🇲',
    category: 'Country',
  },
  {
    alias: 'game_die',
    unicode: '🎲',
    category: 'Activity',
  },
  {
    alias: 'garlic',
    unicode: '🧄',
    category: 'Food',
  },
  {
    alias: ['gb', 'uk'],
    unicode: '🇬🇧',
    category: 'Country',
  },
  {
    alias: 'gear',
    unicode: '⚙️',
    category: 'Object',
  },
  {
    alias: 'gem',
    unicode: '💎',
    category: 'Object',
  },
  {
    alias: 'gemini',
    unicode: '♊️',
    category: 'Symbol',
  },
  {
    alias: 'genie',
    unicode: '🧞',
    category: 'Person',
  },
  {
    alias: 'genie_man',
    unicode: '🧞‍♂️',
    category: 'Person',
  },
  {
    alias: 'genie_woman',
    unicode: '🧞‍♀️',
    category: 'Person',
  },
  {
    alias: 'georgia',
    unicode: '🇬🇪',
    category: 'Country',
  },
  {
    alias: 'ghana',
    unicode: '🇬🇭',
    category: 'Country',
  },
  {
    alias: 'ghost',
    unicode: '👻',
    category: 'Person',
  },
  {
    alias: 'gibraltar',
    unicode: '🇬🇮',
    category: 'Country',
  },
  {
    alias: 'gift',
    unicode: '🎁',
    category: 'Object',
  },
  {
    alias: 'gift_heart',
    unicode: '💝',
    category: 'Object',
  },
  {
    alias: 'giraffe',
    unicode: '🦒',
    category: 'Animal',
  },
  {
    alias: 'girl',
    unicode: '👧',
    category: 'Person',
  },
  {
    alias: 'globe_with_meridians',
    unicode: '🌐',
    category: 'Nature',
  },
  {
    alias: 'gloves',
    unicode: '🧤',
    category: 'Clothing',
  },
  {
    alias: 'goal_net',
    unicode: '🥅',
    category: 'Activity',
  },
  {
    alias: 'goat',
    unicode: '🐐',
    category: 'Animal',
  },
  {
    alias: 'goggles',
    unicode: '🥽',
    category: 'Activity',
  },
  {
    alias: 'golf',
    unicode: '⛳️',
    category: 'Activity',
  },
  {
    alias: 'golfing',
    unicode: '🏌️',
    category: 'Activity',
  },
  {
    alias: 'golfing_man',
    unicode: '🏌',
    category: 'Activity',
  },
  {
    alias: 'golfing_woman',
    unicode: '🏌️‍♀️',
    category: 'Activity',
  },
  {
    alias: 'gorilla',
    unicode: '🦍',
    category: 'Animal',
  },
  {
    alias: 'grapes',
    unicode: '🍇',
    category: 'Food',
  },
  {
    alias: 'greece',
    unicode: '🇬🇷',
    category: 'Country',
  },
  {
    alias: 'green_apple',
    unicode: '🍏',
    category: 'Food',
  },
  {
    alias: 'green_book',
    unicode: '📗',
    category: 'Object',
  },
  {
    alias: 'green_circle',
    unicode: '🟢',
    category: 'Symbol',
  },
  {
    alias: 'green_heart',
    unicode: '💚',
    category: 'Symbol',
  },
  {
    alias: 'green_salad',
    unicode: '🥗',
    category: 'Food',
  },
  {
    alias: 'green_square',
    unicode: '🟩',
    category: 'Symbol',
  },
  {
    alias: 'greenland',
    unicode: '🇬🇱',
    category: 'Country',
  },
  {
    alias: 'grenada',
    unicode: '🇬🇩',
    category: 'Country',
  },
  {
    alias: 'grey_exclamation',
    unicode: '❕',
    category: 'Symbol',
  },
  {
    alias: 'grey_question',
    unicode: '❔',
    category: 'Symbol',
  },
  {
    alias: 'grimacing',
    unicode: '😬',
    category: 'Smiley',
  },
  {
    alias: 'grin',
    unicode: '😁',
    category: 'Smiley',
  },
  {
    alias: 'grinning',
    unicode: '😀',
    category: 'Smiley',
  },
  {
    alias: 'guadeloupe',
    unicode: '🇬🇵',
    category: 'Country',
  },
  {
    alias: 'guam',
    unicode: '🇬🇺',
    category: 'Country',
  },
  {
    alias: 'guard',
    unicode: '💂',
    category: 'Person',
  },
  {
    alias: 'guardsman',
    unicode: '💂',
    category: 'Person',
  },
  {
    alias: 'guardswoman',
    unicode: '💂‍♀',
    category: 'Person',
  },
  {
    alias: 'guatemala',
    unicode: '🇬🇹',
    category: 'Country',
  },
  {
    alias: 'guernsey',
    unicode: '🇬🇬',
    category: 'Country',
  },
  {
    alias: 'guide_dog',
    unicode: '🦮',
    category: 'Animal',
  },
  {
    alias: 'guinea',
    unicode: '🇬🇳',
    category: 'Country',
  },
  {
    alias: 'guinea_bissau',
    unicode: '🇬🇼',
    category: 'Country',
  },
  {
    alias: 'guitar',
    unicode: '🎸',
    category: 'Activity',
  },
  {
    alias: 'gun',
    unicode: '🔫',
    category: 'Object',
  },
  {
    alias: 'guyana',
    unicode: '🇬🇾',
    category: 'Country',
  },
  {
    alias: 'haircut_man',
    unicode: '💇‍♂',
    category: 'Person',
  },
  {
    alias: ['haircut_woman', 'haircut'],
    unicode: '💇',
    category: 'Person',
  },
  {
    alias: 'haiti',
    unicode: '🇭🇹',
    category: 'Country',
  },
  {
    alias: 'hamburger',
    unicode: '🍔',
    category: 'Food',
  },
  {
    alias: 'hammer',
    unicode: '🔨',
    category: 'Object',
  },
  {
    alias: 'hammer_and_pick',
    unicode: '⚒',
    category: 'Object',
  },
  {
    alias: 'hammer_and_wrench',
    unicode: '🛠',
    category: 'Object',
  },
  {
    alias: 'hamster',
    unicode: '🐹',
    category: 'Animal',
  },
  {
    alias: ['hand', 'raised_hand'],
    unicode: '✋',
    category: 'Gesture',
  },
  {
    alias: 'hand_over_mouth',
    unicode: '🤭',
    category: 'Smiley',
  },
  {
    alias: 'handbag',
    unicode: '👜',
    category: 'Object',
  },
  {
    alias: 'handball_person',
    unicode: '🤾',
    category: 'Activity',
  },
  {
    alias: 'handshake',
    unicode: '🤝',
    category: 'Gesture',
  },
  {
    alias: ['hankey', 'poop', 'shit'],
    unicode: '💩',
    category: 'Person',
  },
  {
    alias: 'hash',
    unicode: '#️⃣',
    category: 'Symbol',
  },
  {
    alias: 'hatched_chick',
    unicode: '🐥',
    category: 'Animal',
  },
  {
    alias: 'hatching_chick',
    unicode: '🐣',
    category: 'Animal',
  },
  {
    alias: 'headphones',
    unicode: '🎧',
    category: 'Activity',
  },
  {
    alias: 'headstone',
    unicode: '🪦',
    category: 'Object',
  },
  {
    alias: 'health_worker',
    unicode: '🧑‍⚕️',
    category: 'Person',
  },
  {
    alias: 'hear_no_evil',
    unicode: '🙉',
    category: 'Animal',
  },
  {
    alias: 'heard_mcdonald_islands',
    unicode: '🇭🇲',
    category: 'Country',
  },
  {
    alias: 'heart',
    unicode: '❤️',
    category: 'Symbol',
  },
  {
    alias: 'heart_decoration',
    unicode: '💟',
    category: 'Symbol',
  },
  {
    alias: 'heart_eyes',
    unicode: '😍',
    category: 'Smiley',
  },
  {
    alias: 'heart_eyes_cat',
    unicode: '😻',
    category: 'Smiley',
  },
  {
    alias: 'heart_on_fire',
    unicode: '❤️‍🔥',
    category: 'Symbol',
  },
  {
    alias: 'heartbeat',
    unicode: '💓',
    category: 'Symbol',
  },
  {
    alias: 'heartpulse',
    unicode: '💗',
    category: 'Symbol',
  },
  {
    alias: 'hearts',
    unicode: '♥️',
    category: 'Symbol',
  },
  {
    alias: 'heavy_check_mark',
    unicode: '✔️',
    category: 'Symbol',
  },
  {
    alias: 'heavy_division_sign',
    unicode: '➗',
    category: 'Symbol',
  },
  {
    alias: 'heavy_dollar_sign',
    unicode: '💲',
    category: 'Symbol',
  },
  {
    alias: 'heavy_heart_exclamation',
    unicode: '❣️',
    category: 'Symbol',
  },
  {
    alias: 'heavy_minus_sign',
    unicode: '➖',
    category: 'Symbol',
  },
  {
    alias: 'heavy_multiplication_x',
    unicode: '✖️',
    category: 'Symbol',
  },
  {
    alias: 'heavy_plus_sign',
    unicode: '➕',
    category: 'Symbol',
  },
  {
    alias: 'hedgehog',
    unicode: '🦔',
    category: 'Animal',
  },
  {
    alias: 'helicopter',
    unicode: '🚁',
    category: 'Travel',
  },
  {
    alias: 'herb',
    unicode: '🌿',
    category: 'Nature',
  },
  {
    alias: 'hibiscus',
    unicode: '🌺',
    category: 'Nature',
  },
  {
    alias: 'high_brightness',
    unicode: '🔆',
    category: 'Object',
  },
  {
    alias: 'high_heel',
    unicode: '👠',
    category: 'Object',
  },
  {
    alias: 'hiking_boot',
    unicode: '🥾',
    category: 'Clothing',
  },
  {
    alias: 'hindu_temple',
    unicode: '🛕',
    category: 'Travel',
  },
  {
    alias: 'hippopotamus',
    unicode: '🦛',
    category: 'Animal',
  },
  {
    alias: ['hocho', 'knife'],
    unicode: '🔪',
    category: 'Object',
  },
  {
    alias: 'hole',
    unicode: '🕳',
    category: 'Object',
  },
  {
    alias: 'honduras',
    unicode: '🇭🇳',
    category: 'Country',
  },
  {
    alias: 'honey_pot',
    unicode: '🍯',
    category: 'Food',
  },
  {
    alias: 'hong_kong',
    unicode: '🇭🇰',
    category: 'Country',
  },
  {
    alias: 'hook',
    unicode: '🪝',
    category: 'Object',
  },
  {
    alias: 'horse',
    unicode: '🐴',
    category: 'Animal',
  },
  {
    alias: 'horse_racing',
    unicode: '🏇',
    category: 'Activity',
  },
  {
    alias: 'hospital',
    unicode: '🏥',
    category: 'Travel',
  },
  {
    alias: 'hot_face',
    unicode: '🥵',
    category: 'Smiley',
  },
  {
    alias: 'hot_pepper',
    unicode: '🌶',
    category: 'Food',
  },
  {
    alias: 'hotdog',
    unicode: '🌭',
    category: 'Food',
  },
  {
    alias: 'hotel',
    unicode: '🏨',
    category: 'Travel',
  },
  {
    alias: 'hotsprings',
    unicode: '♨️',
    category: 'Symbol',
  },
  {
    alias: 'hourglass',
    unicode: '⌛️',
    category: 'Object',
  },
  {
    alias: 'hourglass_flowing_sand',
    unicode: '⏳',
    category: 'Object',
  },
  {
    alias: 'house',
    unicode: '🏠',
    category: 'Travel',
  },
  {
    alias: 'house_with_garden',
    unicode: '🏡',
    category: 'Travel',
  },
  {
    alias: 'houses',
    unicode: '🏘',
    category: 'Travel',
  },
  {
    alias: 'hugs',
    unicode: '🤗',
    category: 'Smiley',
  },
  {
    alias: 'hungary',
    unicode: '🇭🇺',
    category: 'Country',
  },
  {
    alias: 'hushed',
    unicode: '😯',
    category: 'Smiley',
  },
  {
    alias: 'hut',
    unicode: '🛖',
    category: 'Travel',
  },
  {
    alias: 'ice_cream',
    unicode: '🍨',
    category: 'Food',
  },
  {
    alias: 'ice_cube',
    unicode: '🧊',
    category: 'Food',
  },
  {
    alias: 'ice_hockey',
    unicode: '🏒',
    category: 'Activity',
  },
  {
    alias: 'ice_skate',
    unicode: '⛸',
    category: 'Activity',
  },
  {
    alias: 'icecream',
    unicode: '🍦',
    category: 'Food',
  },
  {
    alias: 'iceland',
    unicode: '🇮🇸',
    category: 'Country',
  },
  {
    alias: 'id',
    unicode: '🆔',
    category: 'Symbol',
  },
  {
    alias: 'ideograph_advantage',
    unicode: '🉐',
    category: 'Symbol',
  },
  {
    alias: 'imp',
    unicode: '👿',
    category: 'Smiley',
  },
  {
    alias: 'inbox_tray',
    unicode: '📥',
    category: 'Object',
  },
  {
    alias: 'incoming_envelope',
    unicode: '📨',
    category: 'Object',
  },
  {
    alias: 'india',
    unicode: '🇮🇳',
    category: 'Country',
  },
  {
    alias: 'indonesia',
    unicode: '🇮🇩',
    category: 'Country',
  },
  {
    alias: 'infinity',
    unicode: '♾️',
    category: 'Symbol',
  },
  {
    alias: 'information_source',
    unicode: 'ℹ️',
    category: 'Symbol',
  },
  {
    alias: 'innocent',
    unicode: '😇',
    category: 'Smiley',
  },
  {
    alias: 'interrobang',
    unicode: '⁉️',
    category: 'Symbol',
  },
  {
    alias: 'iphone',
    unicode: '📱',
    category: 'Object',
  },
  {
    alias: 'iran',
    unicode: '🇮🇷',
    category: 'Country',
  },
  {
    alias: 'iraq',
    unicode: '🇮🇶',
    category: 'Country',
  },
  {
    alias: 'ireland',
    unicode: '🇮🇪',
    category: 'Country',
  },
  {
    alias: 'isle_of_man',
    unicode: '🇮🇲',
    category: 'Country',
  },
  {
    alias: 'israel',
    unicode: '🇮🇱',
    category: 'Country',
  },
  {
    alias: 'it',
    unicode: '🇮🇹',
    category: 'Country',
  },
  {
    alias: 'jack_o_lantern',
    unicode: '🎃',
    category: 'Person',
  },
  {
    alias: 'jamaica',
    unicode: '🇯🇲',
    category: 'Country',
  },
  {
    alias: 'japan',
    unicode: '🗾',
    category: 'Travel',
  },
  {
    alias: 'japanese_castle',
    unicode: '🏯',
    category: 'Travel',
  },
  {
    alias: 'japanese_goblin',
    unicode: '👺',
    category: 'Person',
  },
  {
    alias: 'japanese_ogre',
    unicode: '👹',
    category: 'Person',
  },
  {
    alias: 'jeans',
    unicode: '👖',
    category: 'Object',
  },
  {
    alias: 'jersey',
    unicode: '🇯🇪',
    category: 'Country',
  },
  {
    alias: 'jigsaw',
    unicode: '🧩',
    category: 'Object',
  },
  {
    alias: 'jordan',
    unicode: '🇯🇴',
    category: 'Country',
  },
  {
    alias: 'joy',
    unicode: '😂',
    category: 'Smiley',
  },
  {
    alias: 'joy_cat',
    unicode: '😹',
    category: 'Smiley',
  },
  {
    alias: 'joystick',
    unicode: '🕹',
    category: 'Object',
  },
  {
    alias: 'jp',
    unicode: '🇯🇵',
    category: 'Country',
  },
  {
    alias: 'judge',
    unicode: '🧑‍⚖️',
    category: 'Person',
  },
  {
    alias: 'juggling_person',
    unicode: '🤹',
    category: 'Person',
  },
  {
    alias: 'kaaba',
    unicode: '🕋',
    category: 'Object',
  },
  {
    alias: 'kangaroo',
    unicode: '🦘',
    category: 'Animal',
  },
  {
    alias: 'kazakhstan',
    unicode: '🇰🇿',
    category: 'Country',
  },
  {
    alias: 'kenya',
    unicode: '🇰🇪',
    category: 'Country',
  },
  {
    alias: 'key',
    unicode: '🔑',
    category: 'Object',
  },
  {
    alias: 'keyboard',
    unicode: '⌨️',
    category: 'Object',
  },
  {
    alias: 'keycap_ten',
    unicode: '🔟',
    category: 'Symbol',
  },
  {
    alias: 'kick_scooter',
    unicode: '🛴',
    category: 'Travel',
  },
  {
    alias: 'kimono',
    unicode: '👘',
    category: 'Object',
  },
  {
    alias: 'kiribati',
    unicode: '🇰🇮',
    category: 'Country',
  },
  {
    alias: 'kiss',
    unicode: '💋',
    category: 'Person',
  },
  {
    alias: 'kissing',
    unicode: '😗',
    category: 'Smiley',
  },
  {
    alias: 'kissing_cat',
    unicode: '😽',
    category: 'Smiley',
  },
  {
    alias: 'kissing_closed_eyes',
    unicode: '😚',
    category: 'Smiley',
  },
  {
    alias: 'kissing_heart',
    unicode: '😘',
    category: 'Smiley',
  },
  {
    alias: 'kissing_smiling_eyes',
    unicode: '😙',
    category: 'Smiley',
  },
  {
    alias: 'kite',
    unicode: '🪁',
    category: 'Object',
  },
  {
    alias: 'kiwi_fruit',
    unicode: '🥝',
    category: 'Food',
  },
  {
    alias: 'kneeling_man',
    unicode: '🧎‍♂️',
    category: 'Person',
  },
  {
    alias: 'kneeling_person',
    unicode: '🧎',
    category: 'Person',
  },
  {
    alias: 'kneeling_woman',
    unicode: '🧎‍♀️',
    category: 'Person',
  },
  {
    alias: 'knot',
    unicode: '🪢',
    category: 'Object',
  },
  {
    alias: 'koala',
    unicode: '🐨',
    category: 'Animal',
  },
  {
    alias: 'koko',
    unicode: '🈁',
    category: 'Symbol',
  },
  {
    alias: 'kosovo',
    unicode: '🇽🇰',
    category: 'Country',
  },
  {
    alias: 'kr',
    unicode: '🇰🇷',
    category: 'Country',
  },
  {
    alias: 'kuwait',
    unicode: '🇰🇼',
    category: 'Country',
  },
  {
    alias: 'kyrgyzstan',
    unicode: '🇰🇬',
    category: 'Country',
  },
  {
    alias: 'lab_coat',
    unicode: '🥼',
    category: 'Clothing',
  },
  {
    alias: 'label',
    unicode: '🏷',
    category: 'Object',
  },
  {
    alias: 'lacrosse',
    unicode: '🥍',
    category: 'Activity',
  },
  {
    alias: 'ladder',
    unicode: '🪜',
    category: 'Object',
  },
  {
    alias: 'lady_beetle',
    unicode: '🐞',
    category: 'Animal',
  },
  {
    alias: ['lantern', 'izakaya_lantern'],
    unicode: '🏮',
    category: 'Object',
  },
  {
    alias: 'laos',
    unicode: '🇱🇦',
    category: 'Country',
  },
  {
    alias: 'large_blue_circle',
    unicode: '🔵',
    category: 'Symbol',
  },
  {
    alias: 'large_blue_diamond',
    unicode: '🔷',
    category: 'Symbol',
  },
  {
    alias: 'large_orange_diamond',
    unicode: '🔶',
    category: 'Symbol',
  },
  {
    alias: 'last_quarter_moon',
    unicode: '🌗',
    category: 'Nature',
  },
  {
    alias: 'last_quarter_moon_with_face',
    unicode: '🌜',
    category: 'Nature',
  },
  {
    alias: 'latin_cross',
    unicode: '✝️',
    category: 'Symbol',
  },
  {
    alias: 'latvia',
    unicode: '🇱🇻',
    category: 'Country',
  },
  {
    alias: ['laughing', 'satisfied'],
    unicode: '😆',
    category: 'Smiley',
  },
  {
    alias: 'leafy_green',
    unicode: '🥬',
    category: 'Food',
  },
  {
    alias: 'leaves',
    unicode: '🍃',
    category: 'Nature',
  },
  {
    alias: 'lebanon',
    unicode: '🇱🇧',
    category: 'Country',
  },
  {
    alias: 'ledger',
    unicode: '📒',
    category: 'Object',
  },
  {
    alias: 'left_luggage',
    unicode: '🛅',
    category: 'Symbol',
  },
  {
    alias: 'left_right_arrow',
    unicode: '↔️',
    category: 'Symbol',
  },
  {
    alias: 'left_speech_bubble',
    unicode: '🗨️',
    category: 'Symbol',
  },
  {
    alias: 'leftwards_arrow_with_hook',
    unicode: '↩️',
    category: 'Symbol',
  },
  {
    alias: 'leg',
    unicode: '🦵',
    category: 'Person',
  },
  {
    alias: 'lemon',
    unicode: '🍋',
    category: 'Food',
  },
  {
    alias: 'leo',
    unicode: '♌️',
    category: 'Symbol',
  },
  {
    alias: 'leopard',
    unicode: '🐆',
    category: 'Animal',
  },
  {
    alias: 'lesotho',
    unicode: '🇱🇸',
    category: 'Country',
  },
  {
    alias: 'level_slider',
    unicode: '🎚',
    category: 'Object',
  },
  {
    alias: 'liberia',
    unicode: '🇱🇷',
    category: 'Country',
  },
  {
    alias: 'libra',
    unicode: '♎️',
    category: 'Symbol',
  },
  {
    alias: 'libya',
    unicode: '🇱🇾',
    category: 'Country',
  },
  {
    alias: 'liechtenstein',
    unicode: '🇱🇮',
    category: 'Country',
  },
  {
    alias: 'light_rail',
    unicode: '🚈',
    category: 'Travel',
  },
  {
    alias: 'link',
    unicode: '🔗',
    category: 'Symbol',
  },
  {
    alias: 'lion',
    unicode: '🦁',
    category: 'Animal',
  },
  {
    alias: 'lips',
    unicode: '👄',
    category: 'Person',
  },
  {
    alias: 'lipstick',
    unicode: '💄',
    category: 'Object',
  },
  {
    alias: 'lithuania',
    unicode: '🇱🇹',
    category: 'Country',
  },
  {
    alias: 'lizard',
    unicode: '🦎',
    category: 'Animal',
  },
  {
    alias: 'llama',
    unicode: '🦙',
    category: 'Animal',
  },
  {
    alias: 'lobster',
    unicode: '🦞',
    category: 'Animal',
  },
  {
    alias: 'lock',
    unicode: '🔒',
    category: 'Object',
  },
  {
    alias: 'lock_with_ink_pen',
    unicode: '🔏',
    category: 'Object',
  },
  {
    alias: 'lollipop',
    unicode: '🍭',
    category: 'Food',
  },
  {
    alias: 'long_drum',
    unicode: '🪘',
    category: 'Activity',
  },
  {
    alias: 'loop',
    unicode: '➿',
    category: 'Object',
  },
  {
    alias: 'lotion_bottle',
    unicode: '🧴',
    category: 'Object',
  },
  {
    alias: 'lotus_position',
    unicode: '🧘',
    category: 'Person',
  },
  {
    alias: 'lotus_position_man',
    unicode: '🧘‍♂️',
    category: 'Person',
  },
  {
    alias: 'lotus_position_woman',
    unicode: '🧘‍♀️',
    category: 'Person',
  },
  {
    alias: 'loud_sound',
    unicode: '🔊',
    category: 'Symbol',
  },
  {
    alias: 'loudspeaker',
    unicode: '📢',
    category: 'Symbol',
  },
  {
    alias: 'love_hotel',
    unicode: '🏩',
    category: 'Travel',
  },
  {
    alias: 'love_letter',
    unicode: '💌',
    category: 'Object',
  },
  {
    alias: 'love_you_gesture',
    unicode: '🤟',
    category: 'Gesture',
  },
  {
    alias: 'low_brightness',
    unicode: '🔅',
    category: 'Object',
  },
  {
    alias: 'luggage',
    unicode: '🧳',
    category: 'Object',
  },
  {
    alias: 'lungs',
    unicode: '🫁',
    category: 'Person',
  },
  {
    alias: 'luxembourg',
    unicode: '🇱🇺',
    category: 'Country',
  },
  {
    alias: 'lying_face',
    unicode: '🤥',
    category: 'Smiley',
  },
  {
    alias: 'm',
    unicode: 'Ⓜ️',
    category: 'Symbol',
  },
  {
    alias: 'macau',
    unicode: '🇲🇴',
    category: 'Country',
  },
  {
    alias: 'macedonia',
    unicode: '🇲🇰',
    category: 'Country',
  },
  {
    alias: 'madagascar',
    unicode: '🇲🇬',
    category: 'Country',
  },
  {
    alias: 'mag',
    unicode: '🔍',
    category: 'Object',
  },
  {
    alias: 'mag_right',
    unicode: '🔎',
    category: 'Object',
  },
  {
    alias: 'mage',
    unicode: '🧙',
    category: 'Person',
  },
  {
    alias: 'mage_man',
    unicode: '🧙‍♂️',
    category: 'Person',
  },
  {
    alias: 'mage_woman',
    unicode: '🧙‍♀️',
    category: 'Person',
  },
  {
    alias: 'magic_wand',
    unicode: '🪄',
    category: 'Activity',
  },
  {
    alias: 'magnet',
    unicode: '🧲',
    category: 'Object',
  },
  {
    alias: 'mahjong',
    unicode: '🀄️',
    category: 'Object',
  },
  {
    alias: 'mailbox',
    unicode: '📫',
    category: 'Object',
  },
  {
    alias: 'mailbox_closed',
    unicode: '📪',
    category: 'Object',
  },
  {
    alias: 'mailbox_with_mail',
    unicode: '📬',
    category: 'Object',
  },
  {
    alias: 'mailbox_with_no_mail',
    unicode: '📭',
    category: 'Object',
  },
  {
    alias: 'malawi',
    unicode: '🇲🇼',
    category: 'Country',
  },
  {
    alias: 'malaysia',
    unicode: '🇲🇾',
    category: 'Country',
  },
  {
    alias: 'maldives',
    unicode: '🇲🇻',
    category: 'Country',
  },
  {
    alias: ['male_detective', 'detective'],
    unicode: '🕵',
    category: 'Person',
  },
  {
    alias: 'male_sign',
    unicode: '♂️',
    category: 'Symbol',
  },
  {
    alias: 'mali',
    unicode: '🇲🇱',
    category: 'Country',
  },
  {
    alias: 'malta',
    unicode: '🇲🇹',
    category: 'Country',
  },
  {
    alias: 'mammoth',
    unicode: '🦣',
    category: 'Animal',
  },
  {
    alias: 'man',
    unicode: '👨',
    category: 'Person',
  },
  {
    alias: 'man_artist',
    unicode: '👨‍🎨',
    category: 'Person',
  },
  {
    alias: 'man_astronaut',
    unicode: '👨‍🚀',
    category: 'Person',
  },
  {
    alias: 'man_beard',
    unicode: '🧔‍♂️',
    category: 'Person',
  },
  {
    alias: 'man_cartwheeling',
    unicode: '🤸‍♂',
    category: 'Activity',
  },
  {
    alias: 'man_cook',
    unicode: '👨‍🍳',
    category: 'Person',
  },
  {
    alias: 'man_dancing',
    unicode: '🕺',
    category: 'Person',
  },
  {
    alias: 'man_facepalming',
    unicode: '🤦‍♂',
    category: 'Person',
  },
  {
    alias: 'man_factory_worker',
    unicode: '👨‍🏭',
    category: 'Person',
  },
  {
    alias: 'man_farmer',
    unicode: '👨‍🌾',
    category: 'Person',
  },
  {
    alias: 'man_feeding_baby',
    unicode: '👨‍🍼',
    category: 'Person',
  },
  {
    alias: 'man_firefighter',
    unicode: '👨‍🚒',
    category: 'Person',
  },
  {
    alias: 'man_health_worker',
    unicode: '👨‍⚕',
    category: 'Person',
  },
  {
    alias: 'man_in_manual_wheelchair',
    unicode: '👨‍🦽',
    category: 'Person',
  },
  {
    alias: 'man_in_motorized_wheelchair',
    unicode: '👨‍🦼',
    category: 'Person',
  },
  {
    alias: 'man_in_tuxedo',
    unicode: '🤵',
    category: 'Person',
  },
  {
    alias: 'man_judge',
    unicode: '👨‍⚖',
    category: 'Person',
  },
  {
    alias: 'man_juggling',
    unicode: '🤹‍♂',
    category: 'Activity',
  },
  {
    alias: 'man_mechanic',
    unicode: '👨‍🔧',
    category: 'Person',
  },
  {
    alias: 'man_office_worker',
    unicode: '👨‍💼',
    category: 'Person',
  },
  {
    alias: 'man_pilot',
    unicode: '👨‍✈',
    category: 'Person',
  },
  {
    alias: 'man_playing_handball',
    unicode: '🤾‍♂',
    category: 'Activity',
  },
  {
    alias: 'man_playing_water_polo',
    unicode: '🤽‍♂',
    category: 'Activity',
  },
  {
    alias: 'man_scientist',
    unicode: '👨‍🔬',
    category: 'Person',
  },
  {
    alias: 'man_shrugging',
    unicode: '🤷‍♂',
    category: 'Person',
  },
  {
    alias: 'man_singer',
    unicode: '👨‍🎤',
    category: 'Person',
  },
  {
    alias: 'man_student',
    unicode: '👨‍🎓',
    category: 'Person',
  },
  {
    alias: 'man_teacher',
    unicode: '👨‍🏫',
    category: 'Person',
  },
  {
    alias: 'man_technologist',
    unicode: '👨‍💻',
    category: 'Person',
  },
  {
    alias: 'man_with_gua_pi_mao',
    unicode: '👲',
    category: 'Person',
  },
  {
    alias: 'man_with_probing_cane',
    unicode: '👨‍🦯',
    category: 'Person',
  },
  {
    alias: 'man_with_turban',
    unicode: '👳',
    category: 'Person',
  },
  {
    alias: 'man_with_veil',
    unicode: '👰‍♂️',
    category: 'Person',
  },
  {
    alias: 'mango',
    unicode: '🥭',
    category: 'Food',
  },
  {
    alias: 'mantelpiece_clock',
    unicode: '🕰',
    category: 'Object',
  },
  {
    alias: 'manual_wheelchair',
    unicode: '🦽',
    category: 'Object',
  },
  {
    alias: 'maple_leaf',
    unicode: '🍁',
    category: 'Nature',
  },
  {
    alias: 'marshall_islands',
    unicode: '🇲🇭',
    category: 'Country',
  },
  {
    alias: 'martial_arts_uniform',
    unicode: '🥋',
    category: 'Activity',
  },
  {
    alias: 'martinique',
    unicode: '🇲🇶',
    category: 'Country',
  },
  {
    alias: 'mask',
    unicode: '😷',
    category: 'Person',
  },
  {
    alias: 'massage_man',
    unicode: '💆‍♂',
    category: 'Person',
  },
  {
    alias: ['massage_woman', 'massage'],
    unicode: '💆',
    category: 'Person',
  },
  {
    alias: 'mate',
    unicode: '🧉',
    category: 'Food',
  },
  {
    alias: 'mauritania',
    unicode: '🇲🇷',
    category: 'Country',
  },
  {
    alias: 'mauritius',
    unicode: '🇲🇺',
    category: 'Country',
  },
  {
    alias: 'mayotte',
    unicode: '🇾🇹',
    category: 'Country',
  },
  {
    alias: 'meat_on_bone',
    unicode: '🍖',
    category: 'Food',
  },
  {
    alias: 'mechanic',
    unicode: '🧑‍🔧',
    category: 'Person',
  },
  {
    alias: 'mechanical_arm',
    unicode: '🦾',
    category: 'Object',
  },
  {
    alias: 'mechanical_leg',
    unicode: '🦿',
    category: 'Object',
  },
  {
    alias: 'medal_military',
    unicode: '🎖',
    category: 'Activity',
  },
  {
    alias: 'medal_sports',
    unicode: '🏅',
    category: 'Activity',
  },
  {
    alias: 'medical_symbol',
    unicode: '⚕️',
    category: 'Symbol',
  },
  {
    alias: 'mega',
    unicode: '📣',
    category: 'Object',
  },
  {
    alias: 'melon',
    unicode: '🍈',
    category: 'Food',
  },
  {
    alias: ['memo', 'pencil'],
    unicode: '📝',
    category: 'Object',
  },
  {
    alias: 'men_wrestling',
    unicode: '🤼‍♂',
    category: 'Activity',
  },
  {
    alias: 'mending_heart',
    unicode: '❤️‍🩹',
    category: 'Symbol',
  },
  {
    alias: 'menorah',
    unicode: '🕎',
    category: 'Symbol',
  },
  {
    alias: 'mens',
    unicode: '🚹',
    category: 'Symbol',
  },
  {
    alias: 'mermaid',
    unicode: '🧜‍♀️',
    category: 'Person',
  },
  {
    alias: 'merman',
    unicode: '🧜‍♂️',
    category: 'Person',
  },
  {
    alias: 'merperson',
    unicode: '🧜',
    category: 'Person',
  },
  {
    alias: 'metal',
    unicode: '🤘',
    category: 'Gesture',
  },
  {
    alias: 'metro',
    unicode: '🚇',
    category: 'Symbol',
  },
  {
    alias: 'mexico',
    unicode: '🇲🇽',
    category: 'Country',
  },
  {
    alias: 'microbe',
    unicode: '🦠',
    category: 'Animal',
  },
  {
    alias: 'micronesia',
    unicode: '🇫🇲',
    category: 'Country',
  },
  {
    alias: 'microphone',
    unicode: '🎤',
    category: 'Activity',
  },
  {
    alias: 'microscope',
    unicode: '🔬',
    category: 'Object',
  },
  {
    alias: ['middle_finger', 'fu'],
    unicode: '🖕',
    category: 'Gesture',
  },
  {
    alias: 'military_helmet',
    unicode: '🪖',
    category: 'Clothing',
  },
  {
    alias: 'milk_glass',
    unicode: '🥛',
    category: 'Food',
  },
  {
    alias: 'milky_way',
    unicode: '🌌',
    category: 'Nature',
  },
  {
    alias: 'minibus',
    unicode: '🚐',
    category: 'Travel',
  },
  {
    alias: 'minidisc',
    unicode: '💽',
    category: 'Object',
  },
  {
    alias: 'mirror',
    unicode: '🪞',
    category: 'Object',
  },
  {
    alias: 'mobile_phone_off',
    unicode: '📴',
    category: 'Symbol',
  },
  {
    alias: 'moldova',
    unicode: '🇲🇩',
    category: 'Country',
  },
  {
    alias: 'monaco',
    unicode: '🇲🇨',
    category: 'Country',
  },
  {
    alias: 'money_mouth_face',
    unicode: '🤑',
    category: 'Smiley',
  },
  {
    alias: 'money_with_wings',
    unicode: '💸',
    category: 'Object',
  },
  {
    alias: 'moneybag',
    unicode: '💰',
    category: 'Object',
  },
  {
    alias: 'mongolia',
    unicode: '🇲🇳',
    category: 'Country',
  },
  {
    alias: 'monkey',
    unicode: '🐒',
    category: 'Animal',
  },
  {
    alias: 'monkey_face',
    unicode: '🐵',
    category: 'Animal',
  },
  {
    alias: 'monocle_face',
    unicode: '🧐',
    category: 'Smiley',
  },
  {
    alias: 'monorail',
    unicode: '🚝',
    category: 'Travel',
  },
  {
    alias: 'montenegro',
    unicode: '🇲🇪',
    category: 'Country',
  },
  {
    alias: 'montserrat',
    unicode: '🇲🇸',
    category: 'Country',
  },
  {
    alias: ['moon', 'waxing_gibbous_moon'],
    unicode: '🌔',
    category: 'Nature',
  },
  {
    alias: 'moon_cake',
    unicode: '🥮',
    category: 'Food',
  },
  {
    alias: 'morocco',
    unicode: '🇲🇦',
    category: 'Country',
  },
  {
    alias: 'mortar_board',
    unicode: '🎓',
    category: 'Object',
  },
  {
    alias: 'mosque',
    unicode: '🕌',
    category: 'Travel',
  },
  {
    alias: 'mosquito',
    unicode: '🦟',
    category: 'Animal',
  },
  {
    alias: 'motor_boat',
    unicode: '🛥',
    category: 'Travel',
  },
  {
    alias: 'motor_scooter',
    unicode: '🛵',
    category: 'Travel',
  },
  {
    alias: 'motorcycle',
    unicode: '🏍',
    category: 'Travel',
  },
  {
    alias: 'motorized_wheelchair',
    unicode: '🦼',
    category: 'Object',
  },
  {
    alias: 'motorway',
    unicode: '🛣',
    category: 'Travel',
  },
  {
    alias: 'mount_fuji',
    unicode: '🗻',
    category: 'Travel',
  },
  {
    alias: 'mountain',
    unicode: '⛰',
    category: 'Travel',
  },
  {
    alias: ['mountain_biking_man', 'mountain_bicyclist'],
    unicode: '🚵',
    category: 'Activity',
  },
  {
    alias: 'mountain_biking_woman',
    unicode: '🚵‍♀',
    category: 'Activity',
  },
  {
    alias: 'mountain_cableway',
    unicode: '🚠',
    category: 'Travel',
  },
  {
    alias: 'mountain_railway',
    unicode: '🚞',
    category: 'Travel',
  },
  {
    alias: 'mountain_snow',
    unicode: '🏔',
    category: 'Travel',
  },
  {
    alias: 'mouse',
    unicode: '🐭',
    category: 'Animal',
  },
  {
    alias: 'mouse2',
    unicode: '🐁',
    category: 'Animal',
  },
  {
    alias: 'mouse_trap',
    unicode: '🪤',
    category: 'Object',
  },
  {
    alias: 'movie_camera',
    unicode: '🎥',
    category: 'Object',
  },
  {
    alias: 'moyai',
    unicode: '🗿',
    category: 'Travel',
  },
  {
    alias: 'mozambique',
    unicode: '🇲🇿',
    category: 'Country',
  },
  {
    alias: 'mrs_claus',
    unicode: '🤶',
    category: 'Person',
  },
  {
    alias: 'muscle',
    unicode: '💪',
    category: 'Person',
  },
  {
    alias: 'mushroom',
    unicode: '🍄',
    category: 'Nature',
  },
  {
    alias: 'musical_keyboard',
    unicode: '🎹',
    category: 'Activity',
  },
  {
    alias: 'musical_note',
    unicode: '🎵',
    category: 'Symbol',
  },
  {
    alias: 'musical_score',
    unicode: '🎼',
    category: 'Activity',
  },
  {
    alias: 'mute',
    unicode: '🔇',
    category: 'Symbol',
  },
  {
    alias: 'mx_claus',
    unicode: '🧑‍🎄',
    category: 'Person',
  },
  {
    alias: 'myanmar',
    unicode: '🇲🇲',
    category: 'Country',
  },
  {
    alias: 'nail_care',
    unicode: '💅',
    category: 'Person',
  },
  {
    alias: 'name_badge',
    unicode: '📛',
    category: 'Object',
  },
  {
    alias: 'namibia',
    unicode: '🇳🇦',
    category: 'Country',
  },
  {
    alias: 'national_park',
    unicode: '🏞',
    category: 'Travel',
  },
  {
    alias: 'nauru',
    unicode: '🇳🇷',
    category: 'Country',
  },
  {
    alias: 'nauseated_face',
    unicode: '🤢',
    category: 'Smiley',
  },
  {
    alias: 'nazar_amulet',
    unicode: '🧿',
    category: 'Symbol',
  },
  {
    alias: 'necktie',
    unicode: '👔',
    category: 'Object',
  },
  {
    alias: 'negative_squared_cross_mark',
    unicode: '❎',
    category: 'Symbol',
  },
  {
    alias: 'nepal',
    unicode: '🇳🇵',
    category: 'Country',
  },
  {
    alias: 'nerd_face',
    unicode: '🤓',
    category: 'Smiley',
  },
  {
    alias: 'nesting_dolls',
    unicode: '🪆',
    category: 'Object',
  },
  {
    alias: 'netherlands',
    unicode: '🇳🇱',
    category: 'Country',
  },
  {
    alias: 'neutral_face',
    unicode: '😐',
    category: 'Smiley',
  },
  {
    alias: 'new',
    unicode: '🆕',
    category: 'Symbol',
  },
  {
    alias: 'new_caledonia',
    unicode: '🇳🇨',
    category: 'Country',
  },
  {
    alias: 'new_moon',
    unicode: '🌑',
    category: 'Nature',
  },
  {
    alias: 'new_moon_with_face',
    unicode: '🌚',
    category: 'Nature',
  },
  {
    alias: 'new_zealand',
    unicode: '🇳🇿',
    category: 'Country',
  },
  {
    alias: 'newspaper',
    unicode: '📰',
    category: 'Object',
  },
  {
    alias: 'newspaper_roll',
    unicode: '🗞',
    category: 'Object',
  },
  {
    alias: 'next_track_button',
    unicode: '⏭',
    category: 'Symbol',
  },
  {
    alias: 'ng',
    unicode: '🆖',
    category: 'Symbol',
  },
  {
    alias: 'nicaragua',
    unicode: '🇳🇮',
    category: 'Country',
  },
  {
    alias: 'niger',
    unicode: '🇳🇪',
    category: 'Country',
  },
  {
    alias: 'nigeria',
    unicode: '🇳🇬',
    category: 'Country',
  },
  {
    alias: 'night_with_stars',
    unicode: '🌃',
    category: 'Travel',
  },
  {
    alias: 'nine',
    unicode: '9️⃣',
    category: 'Symbol',
  },
  {
    alias: 'ninja',
    unicode: '🥷',
    category: 'Person',
  },
  {
    alias: 'niue',
    unicode: '🇳🇺',
    category: 'Country',
  },
  {
    alias: 'no_bell',
    unicode: '🔕',
    category: 'Object',
  },
  {
    alias: 'no_bicycles',
    unicode: '🚳',
    category: 'Symbol',
  },
  {
    alias: 'no_entry',
    unicode: '⛔️',
    category: 'Symbol',
  },
  {
    alias: 'no_entry_sign',
    unicode: '🚫',
    category: 'Symbol',
  },
  {
    alias: ['no_good_man', 'ng_man'],
    unicode: '🙅‍♂',
    category: 'Person',
  },
  {
    alias: ['no_good_woman', 'ng_woman', 'no_good'],
    unicode: '🙅',
    category: 'Person',
  },
  {
    alias: 'no_mobile_phones',
    unicode: '📵',
    category: 'Symbol',
  },
  {
    alias: 'no_mouth',
    unicode: '😶',
    category: 'Smiley',
  },
  {
    alias: 'no_pedestrians',
    unicode: '🚷',
    category: 'Symbol',
  },
  {
    alias: 'no_smoking',
    unicode: '🚭',
    category: 'Symbol',
  },
  {
    alias: 'non-potable_water',
    unicode: '🚱',
    category: 'Symbol',
  },
  {
    alias: 'norfolk_island',
    unicode: '🇳🇫',
    category: 'Country',
  },
  {
    alias: 'north_korea',
    unicode: '🇰🇵',
    category: 'Country',
  },
  {
    alias: 'northern_mariana_islands',
    unicode: '🇲🇵',
    category: 'Country',
  },
  {
    alias: 'norway',
    unicode: '🇳🇴',
    category: 'Country',
  },
  {
    alias: 'nose',
    unicode: '👃',
    category: 'Person',
  },
  {
    alias: 'notebook',
    unicode: '📓',
    category: 'Object',
  },
  {
    alias: 'notebook_with_decorative_cover',
    unicode: '📔',
    category: 'Object',
  },
  {
    alias: 'notes',
    unicode: '🎶',
    category: 'Symbol',
  },
  {
    alias: 'nut_and_bolt',
    unicode: '🔩',
    category: 'Object',
  },
  {
    alias: 'o',
    unicode: '⭕️',
    category: 'Symbol',
  },
  {
    alias: 'o2',
    unicode: '🅾️',
    category: 'Symbol',
  },
  {
    alias: 'ocean',
    unicode: '🌊',
    category: 'Nature',
  },
  {
    alias: 'octopus',
    unicode: '🐙',
    category: 'Animal',
  },
  {
    alias: 'oden',
    unicode: '🍢',
    category: 'Food',
  },
  {
    alias: 'office',
    unicode: '🏢',
    category: 'Travel',
  },
  {
    alias: 'office_worker',
    unicode: '🧑‍💼',
    category: 'Person',
  },
  {
    alias: 'oil_drum',
    unicode: '🛢',
    category: 'Object',
  },
  {
    alias: 'ok',
    unicode: '🆗',
    category: 'Symbol',
  },
  {
    alias: 'ok_hand',
    unicode: '👌',
    category: 'Gesture',
  },
  {
    alias: 'ok_man',
    unicode: '🙆‍♂',
    category: 'Person',
  },
  {
    alias: 'ok_person',
    unicode: '🙆',
    category: 'Person',
  },
  {
    alias: 'ok_woman',
    unicode: '🙆',
    category: 'Person',
  },
  {
    alias: 'old_key',
    unicode: '🗝',
    category: 'Object',
  },
  {
    alias: 'older_adult',
    unicode: '🧓',
    category: 'Person',
  },
  {
    alias: 'older_man',
    unicode: '👴',
    category: 'Person',
  },
  {
    alias: 'older_woman',
    unicode: '👵',
    category: 'Person',
  },
  {
    alias: 'olive',
    unicode: '🫒',
    category: 'Food',
  },
  {
    alias: 'om',
    unicode: '🕉',
    category: 'Symbol',
  },
  {
    alias: 'oman',
    unicode: '🇴🇲',
    category: 'Country',
  },
  {
    alias: 'on',
    unicode: '🔛',
    category: 'Symbol',
  },
  {
    alias: 'oncoming_automobile',
    unicode: '🚘',
    category: 'Travel',
  },
  {
    alias: 'oncoming_bus',
    unicode: '🚍',
    category: 'Travel',
  },
  {
    alias: 'oncoming_police_car',
    unicode: '🚔',
    category: 'Travel',
  },
  {
    alias: 'oncoming_taxi',
    unicode: '🚖',
    category: 'Travel',
  },
  {
    alias: 'one',
    unicode: '1️⃣',
    category: 'Symbol',
  },
  {
    alias: 'one_piece_swimsuit',
    unicode: '🩱',
    category: 'Activity',
  },
  {
    alias: 'onion',
    unicode: '🧅',
    category: 'Food',
  },
  {
    alias: 'open_file_folder',
    unicode: '📂',
    category: 'Object',
  },
  {
    alias: 'open_hands',
    unicode: '👐',
    category: 'Gesture',
  },
  {
    alias: 'open_mouth',
    unicode: '😮',
    category: 'Smiley',
  },
  {
    alias: 'open_umbrella',
    unicode: '☂️',
    category: 'Object',
  },
  {
    alias: 'ophiuchus',
    unicode: '⛎',
    category: 'Symbol',
  },
  {
    alias: 'orange_book',
    unicode: '📙',
    category: 'Object',
  },
  {
    alias: 'orange_circle',
    unicode: '🟠',
    category: 'Symbol',
  },
  {
    alias: 'orange_heart',
    unicode: '🧡',
    category: 'Symbol',
  },
  {
    alias: 'orange_square',
    unicode: '🟧',
    category: 'Symbol',
  },
  {
    alias: 'orangutan',
    unicode: '🦧',
    category: 'Animal',
  },
  {
    alias: 'orthodox_cross',
    unicode: '☦️',
    category: 'Symbol',
  },
  {
    alias: 'otter',
    unicode: '🦦',
    category: 'Animal',
  },
  {
    alias: 'outbox_tray',
    unicode: '📤',
    category: 'Object',
  },
  {
    alias: 'owl',
    unicode: '🦉',
    category: 'Animal',
  },
  {
    alias: 'ox',
    unicode: '🐂',
    category: 'Animal',
  },
  {
    alias: 'oyster',
    unicode: '🦪',
    category: 'Animal',
  },
  {
    alias: 'package',
    unicode: '📦',
    category: 'Object',
  },
  {
    alias: 'page_facing_up',
    unicode: '📄',
    category: 'Object',
  },
  {
    alias: 'page_with_curl',
    unicode: '📃',
    category: 'Object',
  },
  {
    alias: 'pager',
    unicode: '📟',
    category: 'Object',
  },
  {
    alias: 'paintbrush',
    unicode: '🖌',
    category: 'Object',
  },
  {
    alias: 'pakistan',
    unicode: '🇵🇰',
    category: 'Country',
  },
  {
    alias: 'palau',
    unicode: '🇵🇼',
    category: 'Country',
  },
  {
    alias: 'palestinian_territories',
    unicode: '🇵🇸',
    category: 'Country',
  },
  {
    alias: 'palm_tree',
    unicode: '🌴',
    category: 'Nature',
  },
  {
    alias: 'palms_up_together',
    unicode: '🤲',
    category: 'Gesture',
  },
  {
    alias: 'panama',
    unicode: '🇵🇦',
    category: 'Country',
  },
  {
    alias: 'pancakes',
    unicode: '🥞',
    category: 'Food',
  },
  {
    alias: 'panda_face',
    unicode: '🐼',
    category: 'Animal',
  },
  {
    alias: 'paperclip',
    unicode: '📎',
    category: 'Object',
  },
  {
    alias: 'paperclips',
    unicode: '🖇',
    category: 'Object',
  },
  {
    alias: 'papua_new_guinea',
    unicode: '🇵🇬',
    category: 'Country',
  },
  {
    alias: 'parachute',
    unicode: '🪂',
    category: 'Object',
  },
  {
    alias: 'paraguay',
    unicode: '🇵🇾',
    category: 'Country',
  },
  {
    alias: 'parasol_on_ground',
    unicode: '⛱',
    category: 'Travel',
  },
  {
    alias: 'parking',
    unicode: '🅿️',
    category: 'Symbol',
  },
  {
    alias: 'parrot',
    unicode: '🦜',
    category: 'Animal',
  },
  {
    alias: 'part_alternation_mark',
    unicode: '〽️',
    category: 'Symbol',
  },
  {
    alias: 'partly_sunny',
    unicode: '⛅️',
    category: 'Nature',
  },
  {
    alias: 'partying_face',
    unicode: '🥳',
    category: 'Smiley',
  },
  {
    alias: 'passenger_ship',
    unicode: '🛳',
    category: 'Travel',
  },
  {
    alias: 'passport_control',
    unicode: '🛂',
    category: 'Symbol',
  },
  {
    alias: 'pause_button',
    unicode: '⏸',
    category: 'Symbol',
  },
  {
    alias: 'peace_symbol',
    unicode: '☮️',
    category: 'Symbol',
  },
  {
    alias: 'peach',
    unicode: '🍑',
    category: 'Food',
  },
  {
    alias: 'peacock',
    unicode: '🦚',
    category: 'Animal',
  },
  {
    alias: 'peanuts',
    unicode: '🥜',
    category: 'Food',
  },
  {
    alias: 'pear',
    unicode: '🍐',
    category: 'Food',
  },
  {
    alias: 'pen',
    unicode: '🖊',
    category: 'Object',
  },
  {
    alias: 'pencil2',
    unicode: '✏️',
    category: 'Object',
  },
  {
    alias: 'penguin',
    unicode: '🐧',
    category: 'Animal',
  },
  {
    alias: 'pensive',
    unicode: '😔',
    category: 'Smiley',
  },
  {
    alias: 'people_holding_hands',
    unicode: '🧑‍🤝‍🧑',
    category: 'Person',
  },
  {
    alias: 'people_hugging',
    unicode: '🫂',
    category: 'Person',
  },
  {
    alias: 'performing_arts',
    unicode: '🎭',
    category: 'Activity',
  },
  {
    alias: 'persevere',
    unicode: '😣',
    category: 'Smiley',
  },
  {
    alias: 'person_bald',
    unicode: '🧑‍🦲',
    category: 'Person',
  },
  {
    alias: 'person_curly_hair',
    unicode: '🧑‍🦱',
    category: 'Person',
  },
  {
    alias: 'person_feeding_baby',
    unicode: '🧑‍🍼',
    category: 'Person',
  },
  {
    alias: 'person_fencing',
    unicode: '🤺',
    category: 'Activity',
  },
  {
    alias: 'person_in_manual_wheelchair',
    unicode: '🧑‍🦽',
    category: 'Person',
  },
  {
    alias: 'person_in_motorized_wheelchair',
    unicode: '🧑‍🦼',
    category: 'Person',
  },
  {
    alias: 'person_in_tuxedo',
    unicode: '🤵🏻',
    category: 'Person',
  },
  {
    alias: 'person_red_hair',
    unicode: '🧑‍🦰',
    category: 'Person',
  },
  {
    alias: 'person_white_hair',
    unicode: '🧑‍🦳',
    category: 'Person',
  },
  {
    alias: 'person_with_probing_cane',
    unicode: '🧑‍🦯',
    category: 'Person',
  },
  {
    alias: 'person_with_turban',
    unicode: '👳',
    category: 'Person',
  },
  {
    alias: 'person_with_veil',
    unicode: '👰',
    category: 'Person',
  },
  {
    alias: 'peru',
    unicode: '🇵🇪',
    category: 'Country',
  },
  {
    alias: 'petri_dish',
    unicode: '🧫',
    category: 'Object',
  },
  {
    alias: 'philippines',
    unicode: '🇵🇭',
    category: 'Country',
  },
  {
    alias: ['phone', 'telephone'],
    unicode: '☎️',
    category: 'Object',
  },
  {
    alias: 'pick',
    unicode: '⛏',
    category: 'Object',
  },
  {
    alias: 'pickup_truck',
    unicode: '🛻',
    category: 'Travel',
  },
  {
    alias: 'pie',
    unicode: '🥧',
    category: 'Food',
  },
  {
    alias: 'pig',
    unicode: '🐷',
    category: 'Animal',
  },
  {
    alias: 'pig2',
    unicode: '🐖',
    category: 'Animal',
  },
  {
    alias: 'pig_nose',
    unicode: '🐽',
    category: 'Animal',
  },
  {
    alias: 'pill',
    unicode: '💊',
    category: 'Object',
  },
  {
    alias: 'pilot',
    unicode: '🧑‍✈️',
    category: 'Person',
  },
  {
    alias: 'pinata',
    unicode: '🪅',
    category: 'Activity',
  },
  {
    alias: 'pinched_fingers',
    unicode: '🤌',
    category: 'Gesture',
  },
  {
    alias: 'pinching_hand',
    unicode: '🤏',
    category: 'Gesture',
  },
  {
    alias: 'pineapple',
    unicode: '🍍',
    category: 'Food',
  },
  {
    alias: 'ping_pong',
    unicode: '🏓',
    category: 'Activity',
  },
  {
    alias: 'pirate_flag',
    unicode: '🏴‍☠️',
    category: 'Flag',
  },
  {
    alias: 'pisces',
    unicode: '♓️',
    category: 'Symbol',
  },
  {
    alias: 'pitcairn_islands',
    unicode: '🇵🇳',
    category: 'Country',
  },
  {
    alias: 'pizza',
    unicode: '🍕',
    category: 'Food',
  },
  {
    alias: 'placard',
    unicode: '🪧',
    category: 'Object',
  },
  {
    alias: 'place_of_worship',
    unicode: '🛐',
    category: 'Symbol',
  },
  {
    alias: 'plate_with_cutlery',
    unicode: '🍽',
    category: 'Food',
  },
  {
    alias: 'play_or_pause_button',
    unicode: '⏯',
    category: 'Symbol',
  },
  {
    alias: 'pleading_face',
    unicode: '🥺',
    category: 'Smiley',
  },
  {
    alias: 'plunger',
    unicode: '🪠',
    category: 'Object',
  },
  {
    alias: 'point_down',
    unicode: '👇',
    category: 'Gesture',
  },
  {
    alias: 'point_left',
    unicode: '👈',
    category: 'Gesture',
  },
  {
    alias: 'point_right',
    unicode: '👉',
    category: 'Gesture',
  },
  {
    alias: 'point_up',
    unicode: '☝️',
    category: 'Gesture',
  },
  {
    alias: 'point_up_2',
    unicode: '👆',
    category: 'Gesture',
  },
  {
    alias: 'poland',
    unicode: '🇵🇱',
    category: 'Country',
  },
  {
    alias: 'polar_bear',
    unicode: '🐻‍❄️',
    category: 'Animal',
  },
  {
    alias: 'police_car',
    unicode: '🚓',
    category: 'Travel',
  },
  {
    alias: 'police_officer',
    unicode: '👮',
    category: 'Person',
  },
  {
    alias: ['policeman', 'cop'],
    unicode: '👮',
    category: 'Person',
  },
  {
    alias: 'policewoman',
    unicode: '👮‍♀',
    category: 'Person',
  },
  {
    alias: 'poodle',
    unicode: '🐩',
    category: 'Animal',
  },
  {
    alias: 'popcorn',
    unicode: '🍿',
    category: 'Food',
  },
  {
    alias: 'portugal',
    unicode: '🇵🇹',
    category: 'Country',
  },
  {
    alias: 'post_office',
    unicode: '🏣',
    category: 'Travel',
  },
  {
    alias: 'postal_horn',
    unicode: '📯',
    category: 'Object',
  },
  {
    alias: 'postbox',
    unicode: '📮',
    category: 'Object',
  },
  {
    alias: 'potable_water',
    unicode: '🚰',
    category: 'Symbol',
  },
  {
    alias: 'potato',
    unicode: '🥔',
    category: 'Food',
  },
  {
    alias: 'potted_plant',
    unicode: '🪴',
    category: 'Nature',
  },
  {
    alias: 'pouch',
    unicode: '👝',
    category: 'Object',
  },
  {
    alias: 'poultry_leg',
    unicode: '🍗',
    category: 'Food',
  },
  {
    alias: 'pound',
    unicode: '💷',
    category: 'Object',
  },
  {
    alias: 'pouting_cat',
    unicode: '😾',
    category: 'Smiley',
  },
  {
    alias: 'pouting_face',
    unicode: '🙎',
    category: 'Person',
  },
  {
    alias: 'pouting_man',
    unicode: '🙎‍♂',
    category: 'Person',
  },
  {
    alias: 'pouting_woman',
    unicode: '🙎',
    category: 'Person',
  },
  {
    alias: 'pray',
    unicode: '🙏',
    category: 'Gesture',
  },
  {
    alias: 'prayer_beads',
    unicode: '📿',
    category: 'Object',
  },
  {
    alias: 'pregnant_woman',
    unicode: '🤰',
    category: 'Person',
  },
  {
    alias: 'pretzel',
    unicode: '🥨',
    category: 'Food',
  },
  {
    alias: 'previous_track_button',
    unicode: '⏮',
    category: 'Symbol',
  },
  {
    alias: 'prince',
    unicode: '🤴',
    category: 'Person',
  },
  {
    alias: 'princess',
    unicode: '👸',
    category: 'Person',
  },
  {
    alias: 'printer',
    unicode: '🖨',
    category: 'Object',
  },
  {
    alias: 'probing_cane',
    unicode: '🦯',
    category: 'Object',
  },
  {
    alias: 'puerto_rico',
    unicode: '🇵🇷',
    category: 'Country',
  },
  {
    alias: 'purple_circle',
    unicode: '🟣',
    category: 'Symbol',
  },
  {
    alias: 'purple_heart',
    unicode: '💜',
    category: 'Symbol',
  },
  {
    alias: 'purple_square',
    unicode: '🟪',
    category: 'Symbol',
  },
  {
    alias: 'purse',
    unicode: '👛',
    category: 'Object',
  },
  {
    alias: 'pushpin',
    unicode: '📌',
    category: 'Object',
  },
  {
    alias: 'put_litter_in_its_place',
    unicode: '🚮',
    category: 'Symbol',
  },
  {
    alias: 'qatar',
    unicode: '🇶🇦',
    category: 'Country',
  },
  {
    alias: 'question',
    unicode: '❓',
    category: 'Symbol',
  },
  {
    alias: 'rabbit',
    unicode: '🐰',
    category: 'Animal',
  },
  {
    alias: 'rabbit2',
    unicode: '🐇',
    category: 'Animal',
  },
  {
    alias: 'raccoon',
    unicode: '🦝',
    category: 'Animal',
  },
  {
    alias: 'racehorse',
    unicode: '🐎',
    category: 'Animal',
  },
  {
    alias: 'racing_car',
    unicode: '🏎',
    category: 'Travel',
  },
  {
    alias: 'radio',
    unicode: '📻',
    category: 'Object',
  },
  {
    alias: 'radio_button',
    unicode: '🔘',
    category: 'Symbol',
  },
  {
    alias: 'radioactive',
    unicode: '☢️',
    category: 'Symbol',
  },
  {
    alias: ['rage', 'pout'],
    unicode: '😡',
    category: 'Smiley',
  },
  {
    alias: 'railway_car',
    unicode: '🚃',
    category: 'Travel',
  },
  {
    alias: 'railway_track',
    unicode: '🛤',
    category: 'Travel',
  },
  {
    alias: 'rainbow',
    unicode: '🌈',
    category: 'Travel',
  },
  {
    alias: 'rainbow_flag',
    unicode: '🏳️‍🌈',
    category: 'Flag',
  },
  {
    alias: 'raised_back_of_hand',
    unicode: '🤚',
    category: 'Gesture',
  },
  {
    alias: 'raised_eyebrow',
    unicode: '🤨',
    category: 'Smiley',
  },
  {
    alias: 'raised_hand_with_fingers_splayed',
    unicode: '🖐',
    category: 'Gesture',
  },
  {
    alias: 'raised_hands',
    unicode: '🙌',
    category: 'Gesture',
  },
  {
    alias: 'raising_hand_man',
    unicode: '🙋‍♂',
    category: 'Person',
  },
  {
    alias: ['raising_hand_woman', 'raising_hand'],
    unicode: '🙋',
    category: 'Person',
  },
  {
    alias: 'ram',
    unicode: '🐏',
    category: 'Animal',
  },
  {
    alias: 'ramen',
    unicode: '🍜',
    category: 'Food',
  },
  {
    alias: 'rat',
    unicode: '🐀',
    category: 'Animal',
  },
  {
    alias: 'razor',
    unicode: '🪒',
    category: 'Object',
  },
  {
    alias: 'receipt',
    unicode: '🧾',
    category: 'Object',
  },
  {
    alias: 'record_button',
    unicode: '⏺',
    category: 'Symbol',
  },
  {
    alias: 'recycle',
    unicode: '♻️',
    category: 'Symbol',
  },
  {
    alias: 'red_circle',
    unicode: '🔴',
    category: 'Symbol',
  },
  {
    alias: 'red_envelope',
    unicode: '🧧',
    category: 'Object',
  },
  {
    alias: 'red_haired_man',
    unicode: '👨‍🦰',
    category: 'Smiley',
  },
  {
    alias: 'red_haired_woman',
    unicode: '👩‍🦰',
    category: 'Smiley',
  },
  {
    alias: 'red_square',
    unicode: '🟥',
    category: 'Symbol',
  },
  {
    alias: 'registered',
    unicode: '®️',
    category: 'Symbol',
  },
  {
    alias: 'relaxed',
    unicode: '☺️',
    category: 'Smiley',
  },
  {
    alias: 'relieved',
    unicode: '😌',
    category: 'Smiley',
  },
  {
    alias: 'reminder_ribbon',
    unicode: '🎗',
    category: 'Activity',
  },
  {
    alias: 'repeat',
    unicode: '🔁',
    category: 'Symbol',
  },
  {
    alias: 'repeat_one',
    unicode: '🔂',
    category: 'Symbol',
  },
  {
    alias: 'rescue_worker_helmet',
    unicode: '⛑',
    category: 'Clothing',
  },
  {
    alias: 'restroom',
    unicode: '🚻',
    category: 'Symbol',
  },
  {
    alias: 'reunion',
    unicode: '🇷🇪',
    category: 'Country',
  },
  {
    alias: 'revolving_hearts',
    unicode: '💞',
    category: 'Symbol',
  },
  {
    alias: 'rewind',
    unicode: '⏪',
    category: 'Symbol',
  },
  {
    alias: 'rhinoceros',
    unicode: '🦏',
    category: 'Animal',
  },
  {
    alias: 'ribbon',
    unicode: '🎀',
    category: 'Object',
  },
  {
    alias: 'rice',
    unicode: '🍚',
    category: 'Food',
  },
  {
    alias: 'rice_ball',
    unicode: '🍙',
    category: 'Food',
  },
  {
    alias: 'rice_cracker',
    unicode: '🍘',
    category: 'Food',
  },
  {
    alias: 'rice_scene',
    unicode: '🎑',
    category: 'Object',
  },
  {
    alias: 'right_anger_bubble',
    unicode: '🗯',
    category: 'Symbol',
  },
  {
    alias: 'ring',
    unicode: '💍',
    category: 'Object',
  },
  {
    alias: 'ringed_planet',
    unicode: '🪐',
    category: 'Nature',
  },
  {
    alias: 'robot',
    unicode: '🤖',
    category: 'Smiley',
  },
  {
    alias: 'rock',
    unicode: '🪨',
    category: 'Nature',
  },
  {
    alias: 'rocket',
    unicode: '🚀',
    category: 'Travel',
  },
  {
    alias: 'rofl',
    unicode: '🤣',
    category: 'Smiley',
  },
  {
    alias: 'roll_eyes',
    unicode: '🙄',
    category: 'Smiley',
  },
  {
    alias: 'roll_of_paper',
    unicode: '🧻',
    category: 'Object',
  },
  {
    alias: 'roller_coaster',
    unicode: '🎢',
    category: 'Travel',
  },
  {
    alias: 'roller_skate',
    unicode: '🛼',
    category: 'Activity',
  },
  {
    alias: 'romania',
    unicode: '🇷🇴',
    category: 'Country',
  },
  {
    alias: 'rooster',
    unicode: '🐓',
    category: 'Animal',
  },
  {
    alias: 'rose',
    unicode: '🌹',
    category: 'Nature',
  },
  {
    alias: 'rosette',
    unicode: '🏵',
    category: 'Activity',
  },
  {
    alias: 'rotating_light',
    unicode: '🚨',
    category: 'Travel',
  },
  {
    alias: 'round_pushpin',
    unicode: '📍',
    category: 'Travel',
  },
  {
    alias: ['rowing_man', 'rowboat'],
    unicode: '🚣',
    category: 'Activity',
  },
  {
    alias: 'rowing_woman',
    unicode: '🚣‍♀',
    category: 'Activity',
  },
  {
    alias: 'ru',
    unicode: '🇷🇺',
    category: 'Country',
  },
  {
    alias: 'rugby_football',
    unicode: '🏉',
    category: 'Activity',
  },
  {
    alias: ['running_man', 'runner', 'running'],
    unicode: '🏃',
    category: 'Person',
  },
  {
    alias: 'running_shirt_with_sash',
    unicode: '🎽',
    category: 'Activity',
  },
  {
    alias: 'running_woman',
    unicode: '🏃‍♀',
    category: 'Person',
  },
  {
    alias: 'rwanda',
    unicode: '🇷🇼',
    category: 'Country',
  },
  {
    alias: 'sa',
    unicode: '🈂️',
    category: 'Symbol',
  },
  {
    alias: 'safety_pin',
    unicode: '🧷',
    category: 'Object',
  },
  {
    alias: 'safety_vest',
    unicode: '🦺',
    category: 'Clothing',
  },
  {
    alias: 'sagittarius',
    unicode: '♐️',
    category: 'Symbol',
  },
  {
    alias: 'sake',
    unicode: '🍶',
    category: 'Food',
  },
  {
    alias: 'salt',
    unicode: '🧂',
    category: 'Food',
  },
  {
    alias: 'samoa',
    unicode: '🇼🇸',
    category: 'Country',
  },
  {
    alias: 'san_marino',
    unicode: '🇸🇲',
    category: 'Country',
  },
  {
    alias: 'sandal',
    unicode: '👡',
    category: 'Object',
  },
  {
    alias: 'sandwich',
    unicode: '🥪',
    category: 'Food',
  },
  {
    alias: 'santa',
    unicode: '🎅',
    category: 'Object',
  },
  {
    alias: 'sao_tome_principe',
    unicode: '🇸🇹',
    category: 'Country',
  },
  {
    alias: 'sari',
    unicode: '🥻',
    category: 'Clothing',
  },
  {
    alias: 'satellite',
    unicode: '📡',
    category: 'Object',
  },
  {
    alias: 'saudi_arabia',
    unicode: '🇸🇦',
    category: 'Country',
  },
  {
    alias: 'sauna_man',
    unicode: '🧖‍♂️',
    category: 'Person',
  },
  {
    alias: 'sauna_person',
    unicode: '🧖',
    category: 'Person',
  },
  {
    alias: 'sauna_woman',
    unicode: '🧖‍♀️',
    category: 'Person',
  },
  {
    alias: 'sauropod',
    unicode: '🦕',
    category: 'Animal',
  },
  {
    alias: 'saxophone',
    unicode: '🎷',
    category: 'Activity',
  },
  {
    alias: 'scarf',
    unicode: '🧣',
    category: 'Clothing',
  },
  {
    alias: 'school',
    unicode: '🏫',
    category: 'Travel',
  },
  {
    alias: 'school_satchel',
    unicode: '🎒',
    category: 'Object',
  },
  {
    alias: 'scientist',
    unicode: '🧑‍🔬',
    category: 'Person',
  },
  {
    alias: 'scissors',
    unicode: '✂️',
    category: 'Object',
  },
  {
    alias: 'scorpion',
    unicode: '🦂',
    category: 'Animal',
  },
  {
    alias: 'scorpius',
    unicode: '♏️',
    category: 'Symbol',
  },
  {
    alias: 'scotland',
    unicode: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    category: 'Country',
  },
  {
    alias: 'scream',
    unicode: '😱',
    category: 'Smiley',
  },
  {
    alias: 'scream_cat',
    unicode: '🙀',
    category: 'Smiley',
  },
  {
    alias: 'screwdriver',
    unicode: '🪛',
    category: 'Object',
  },
  {
    alias: 'scroll',
    unicode: '📜',
    category: 'Object',
  },
  {
    alias: 'seal',
    unicode: '🦭',
    category: 'Animal',
  },
  {
    alias: 'seat',
    unicode: '💺',
    category: 'Object',
  },
  {
    alias: 'secret',
    unicode: '㊙️',
    category: 'Symbol',
  },
  {
    alias: 'see_no_evil',
    unicode: '🙈',
    category: 'Smiley',
  },
  {
    alias: 'seedling',
    unicode: '🌱',
    category: 'Nature',
  },
  {
    alias: 'selfie',
    unicode: '🤳',
    category: 'Person',
  },
  {
    alias: 'senegal',
    unicode: '🇸🇳',
    category: 'Country',
  },
  {
    alias: 'serbia',
    unicode: '🇷🇸',
    category: 'Country',
  },
  {
    alias: 'service_dog',
    unicode: '🐕‍🦺',
    category: 'Animal',
  },
  {
    alias: 'seven',
    unicode: '7️⃣',
    category: 'Symbol',
  },
  {
    alias: 'sewing_needle',
    unicode: '🪡',
    category: 'Object',
  },
  {
    alias: 'seychelles',
    unicode: '🇸🇨',
    category: 'Country',
  },
  {
    alias: 'shallow_pan_of_food',
    unicode: '🥘',
    category: 'Food',
  },
  {
    alias: 'shamrock',
    unicode: '☘️',
    category: 'Nature',
  },
  {
    alias: 'shark',
    unicode: '🦈',
    category: 'Animal',
  },
  {
    alias: 'shaved_ice',
    unicode: '🍧',
    category: 'Food',
  },
  {
    alias: 'sheep',
    unicode: '🐑',
    category: 'Animal',
  },
  {
    alias: 'shell',
    unicode: '🐚',
    category: 'Nature',
  },
  {
    alias: 'shield',
    unicode: '🛡',
    category: 'Object',
  },
  {
    alias: 'shinto_shrine',
    unicode: '⛩',
    category: 'Travel',
  },
  {
    alias: 'ship',
    unicode: '🚢',
    category: 'Travel',
  },
  {
    alias: ['shirt', 'tshirt'],
    unicode: '👕',
    category: 'Object',
  },
  {
    alias: ['shoe', 'mans_shoe'],
    unicode: '👞',
    category: 'Object',
  },
  {
    alias: 'shopping',
    unicode: '🛍',
    category: 'Object',
  },
  {
    alias: 'shopping_cart',
    unicode: '🛒',
    category: 'Object',
  },
  {
    alias: 'shorts',
    unicode: '🩳',
    category: 'Activity',
  },
  {
    alias: 'shower',
    unicode: '🚿',
    category: 'Object',
  },
  {
    alias: 'shrimp',
    unicode: '🦐',
    category: 'Animal',
  },
  {
    alias: 'shrug',
    unicode: '🤷',
    category: 'Person',
  },
  {
    alias: 'shushing_face',
    unicode: '🤫',
    category: 'Smiley',
  },
  {
    alias: 'sierra_leone',
    unicode: '🇸🇱',
    category: 'Country',
  },
  {
    alias: 'signal_strength',
    unicode: '📶',
    category: 'Symbol',
  },
  {
    alias: 'singapore',
    unicode: '🇸🇬',
    category: 'Country',
  },
  {
    alias: 'singer',
    unicode: '🧑‍🎤',
    category: 'Person',
  },
  {
    alias: 'sint_maarten',
    unicode: '🇸🇽',
    category: 'Country',
  },
  {
    alias: 'six',
    unicode: '6️⃣',
    category: 'Symbol',
  },
  {
    alias: 'six_pointed_star',
    unicode: '🔯',
    category: 'Symbol',
  },
  {
    alias: 'skateboard',
    unicode: '🛹',
    category: 'Activity',
  },
  {
    alias: 'ski',
    unicode: '🎿',
    category: 'Activity',
  },
  {
    alias: 'skier',
    unicode: '⛷',
    category: 'Activity',
  },
  {
    alias: 'skull',
    unicode: '💀',
    category: 'Person',
  },
  {
    alias: 'skull_and_crossbones',
    unicode: '☠️',
    category: 'Person',
  },
  {
    alias: 'skunk',
    unicode: '🦨',
    category: 'Animal',
  },
  {
    alias: 'sled',
    unicode: '🛷',
    category: 'Activity',
  },
  {
    alias: 'sleeping',
    unicode: '😴',
    category: 'Smiley',
  },
  {
    alias: 'sleeping_bed',
    unicode: '🛌',
    category: 'Object',
  },
  {
    alias: 'sleepy',
    unicode: '😪',
    category: 'Smiley',
  },
  {
    alias: 'slightly_frowning_face',
    unicode: '🙁',
    category: 'Smiley',
  },
  {
    alias: 'slightly_smiling_face',
    unicode: '🙂',
    category: 'Smiley',
  },
  {
    alias: 'slot_machine',
    unicode: '🎰',
    category: 'Activity',
  },
  {
    alias: 'sloth',
    unicode: '🦥',
    category: 'Animal',
  },
  {
    alias: 'slovakia',
    unicode: '🇸🇰',
    category: 'Country',
  },
  {
    alias: 'slovenia',
    unicode: '🇸🇮',
    category: 'Country',
  },
  {
    alias: 'small_airplane',
    unicode: '🛩',
    category: 'Travel',
  },
  {
    alias: 'small_blue_diamond',
    unicode: '🔹',
    category: 'Symbol',
  },
  {
    alias: 'small_orange_diamond',
    unicode: '🔸',
    category: 'Symbol',
  },
  {
    alias: 'small_red_triangle',
    unicode: '🔺',
    category: 'Symbol',
  },
  {
    alias: 'small_red_triangle_down',
    unicode: '🔻',
    category: 'Symbol',
  },
  {
    alias: 'smile',
    unicode: '😄',
    category: 'Smiley',
  },
  {
    alias: 'smile_cat',
    unicode: '😸',
    category: 'Smiley',
  },
  {
    alias: 'smiley',
    unicode: '😃',
    category: 'Smiley',
  },
  {
    alias: 'smiley_cat',
    unicode: '😺',
    category: 'Smiley',
  },
  {
    alias: 'smiling_face_with_tear',
    unicode: '🥲',
    category: 'Smiley',
  },
  {
    alias: 'smiling_face_with_three_hearts',
    unicode: '🥰',
    category: 'Smiley',
  },
  {
    alias: 'smiling_imp',
    unicode: '😈',
    category: 'Smiley',
  },
  {
    alias: 'smirk',
    unicode: '😏',
    category: 'Smiley',
  },
  {
    alias: 'smirk_cat',
    unicode: '😼',
    category: 'Smiley',
  },
  {
    alias: 'smoking',
    unicode: '🚬',
    category: 'Object',
  },
  {
    alias: 'snail',
    unicode: '🐌',
    category: 'Animal',
  },
  {
    alias: 'snake',
    unicode: '🐍',
    category: 'Animal',
  },
  {
    alias: 'sneezing_face',
    unicode: '🤧',
    category: 'Smiley',
  },
  {
    alias: 'snowboarder',
    unicode: '🏂',
    category: 'Activity',
  },
  {
    alias: 'snowflake',
    unicode: '❄️',
    category: 'Nature',
  },
  {
    alias: 'snowman',
    unicode: '⛄️',
    category: 'Nature',
  },
  {
    alias: 'snowman_with_snow',
    unicode: '☃️',
    category: 'Nature',
  },
  {
    alias: 'soap',
    unicode: '🧼',
    category: 'Object',
  },
  {
    alias: 'sob',
    unicode: '😭',
    category: 'Smiley',
  },
  {
    alias: 'soccer',
    unicode: '⚽️',
    category: 'Activity',
  },
  {
    alias: 'socks',
    unicode: '🧦',
    category: 'Clothing',
  },
  {
    alias: 'softball',
    unicode: '🥎',
    category: 'Activity',
  },
  {
    alias: 'solomon_islands',
    unicode: '🇸🇧',
    category: 'Country',
  },
  {
    alias: 'somalia',
    unicode: '🇸🇴',
    category: 'Country',
  },
  {
    alias: 'soon',
    unicode: '🔜',
    category: 'Symbol',
  },
  {
    alias: 'sos',
    unicode: '🆘',
    category: 'Symbol',
  },
  {
    alias: 'sound',
    unicode: '🔉',
    category: 'Symbol',
  },
  {
    alias: 'south_africa',
    unicode: '🇿🇦',
    category: 'Country',
  },
  {
    alias: 'south_georgia_south_sandwich_islands',
    unicode: '🇬🇸',
    category: 'Country',
  },
  {
    alias: 'south_sudan',
    unicode: '🇸🇸',
    category: 'Country',
  },
  {
    alias: 'space_invader',
    unicode: '👾',
    category: 'Object',
  },
  {
    alias: 'spades',
    unicode: '♠️',
    category: 'Symbol',
  },
  {
    alias: 'spaghetti',
    unicode: '🍝',
    category: 'Food',
  },
  {
    alias: 'sparkle',
    unicode: '❇️',
    category: 'Symbol',
  },
  {
    alias: 'sparkler',
    unicode: '🎇',
    category: 'Object',
  },
  {
    alias: 'sparkles',
    unicode: '✨',
    category: 'Nature',
  },
  {
    alias: 'sparkling_heart',
    unicode: '💖',
    category: 'Object',
  },
  {
    alias: 'speak_no_evil',
    unicode: '🙊',
    category: 'Animal',
  },
  {
    alias: 'speaker',
    unicode: '🔈',
    category: 'Symbol',
  },
  {
    alias: 'speaking_head',
    unicode: '🗣',
    category: 'Person',
  },
  {
    alias: 'speech_balloon',
    unicode: '💬',
    category: 'Symbol',
  },
  {
    alias: 'speedboat',
    unicode: '🚤',
    category: 'Travel',
  },
  {
    alias: 'spider',
    unicode: '🕷',
    category: 'Animal',
  },
  {
    alias: 'spider_web',
    unicode: '🕸',
    category: 'Object',
  },
  {
    alias: 'spiral_calendar',
    unicode: '🗓',
    category: 'Object',
  },
  {
    alias: 'spiral_notepad',
    unicode: '🗒',
    category: 'Object',
  },
  {
    alias: 'sponge',
    unicode: '🧽',
    category: 'Object',
  },
  {
    alias: 'spoon',
    unicode: '🥄',
    category: 'Food',
  },
  {
    alias: 'squid',
    unicode: '🦑',
    category: 'Animal',
  },
  {
    alias: 'sri_lanka',
    unicode: '🇱🇰',
    category: 'Country',
  },
  {
    alias: 'st_barthelemy',
    unicode: '🇧🇱',
    category: 'Country',
  },
  {
    alias: 'st_helena',
    unicode: '🇸🇭',
    category: 'Country',
  },
  {
    alias: 'st_kitts_nevis',
    unicode: '🇰🇳',
    category: 'Country',
  },
  {
    alias: 'st_lucia',
    unicode: '🇱🇨',
    category: 'Country',
  },
  {
    alias: 'st_martin',
    unicode: '🇲🇫',
    category: 'Country',
  },
  {
    alias: 'st_pierre_miquelon',
    unicode: '🇵🇲',
    category: 'Country',
  },
  {
    alias: 'st_vincent_grenadines',
    unicode: '🇻🇨',
    category: 'Country',
  },
  {
    alias: 'stadium',
    unicode: '🏟',
    category: 'Travel',
  },
  {
    alias: 'standing_man',
    unicode: '🧍‍♂️',
    category: 'Person',
  },
  {
    alias: 'standing_person',
    unicode: '🧍',
    category: 'Person',
  },
  {
    alias: 'standing_woman',
    unicode: '🧍‍♀️',
    category: 'Person',
  },
  {
    alias: 'star',
    unicode: '⭐️',
    category: 'Nature',
  },
  {
    alias: 'star2',
    unicode: '🌟',
    category: 'Nature',
  },
  {
    alias: 'star_and_crescent',
    unicode: '☪️',
    category: 'Symbol',
  },
  {
    alias: 'star_of_david',
    unicode: '✡️',
    category: 'Symbol',
  },
  {
    alias: 'star_struck',
    unicode: '🤩',
    category: 'Smiley',
  },
  {
    alias: 'stars',
    unicode: '🌠',
    category: 'Travel',
  },
  {
    alias: 'station',
    unicode: '🚉',
    category: 'Travel',
  },
  {
    alias: 'statue_of_liberty',
    unicode: '🗽',
    category: 'Travel',
  },
  {
    alias: 'steam_locomotive',
    unicode: '🚂',
    category: 'Travel',
  },
  {
    alias: 'stethoscope',
    unicode: '🩺',
    category: 'Object',
  },
  {
    alias: 'stew',
    unicode: '🍲',
    category: 'Food',
  },
  {
    alias: 'stop_button',
    unicode: '⏹',
    category: 'Symbol',
  },
  {
    alias: 'stop_sign',
    unicode: '🛑',
    category: 'Symbol',
  },
  {
    alias: 'stopwatch',
    unicode: '⏱',
    category: 'Object',
  },
  {
    alias: 'straight_ruler',
    unicode: '📏',
    category: 'Object',
  },
  {
    alias: 'strawberry',
    unicode: '🍓',
    category: 'Food',
  },
  {
    alias: 'stuck_out_tongue',
    unicode: '😛',
    category: 'Smiley',
  },
  {
    alias: 'stuck_out_tongue_closed_eyes',
    unicode: '😝',
    category: 'Smiley',
  },
  {
    alias: 'stuck_out_tongue_winking_eye',
    unicode: '😜',
    category: 'Smiley',
  },
  {
    alias: 'student',
    unicode: '🧑‍🎓',
    category: 'Person',
  },
  {
    alias: 'studio_microphone',
    unicode: '🎙',
    category: 'Object',
  },
  {
    alias: 'stuffed_flatbread',
    unicode: '🥙',
    category: 'Food',
  },
  {
    alias: 'sudan',
    unicode: '🇸🇩',
    category: 'Country',
  },
  {
    alias: 'sun_behind_large_cloud',
    unicode: '🌥',
    category: 'Nature',
  },
  {
    alias: 'sun_behind_rain_cloud',
    unicode: '🌦',
    category: 'Nature',
  },
  {
    alias: 'sun_behind_small_cloud',
    unicode: '🌤',
    category: 'Nature',
  },
  {
    alias: 'sun_with_face',
    unicode: '🌞',
    category: 'Nature',
  },
  {
    alias: 'sunflower',
    unicode: '🌻',
    category: 'Nature',
  },
  {
    alias: 'sunglasses',
    unicode: '😎',
    category: 'Smiley',
  },
  {
    alias: 'sunny',
    unicode: '☀️',
    category: 'Nature',
  },
  {
    alias: 'sunrise',
    unicode: '🌅',
    category: 'Travel',
  },
  {
    alias: 'sunrise_over_mountains',
    unicode: '🌄',
    category: 'Travel',
  },
  {
    alias: 'superhero',
    unicode: '🦸',
    category: 'Person',
  },
  {
    alias: 'superhero_man',
    unicode: '🦸‍♂️',
    category: 'Person',
  },
  {
    alias: 'superhero_woman',
    unicode: '🦸‍♀️',
    category: 'Person',
  },
  {
    alias: 'supervillain',
    unicode: '🦹',
    category: 'Person',
  },
  {
    alias: 'supervillain_man',
    unicode: '🦹‍♂️',
    category: 'Person',
  },
  {
    alias: 'supervillain_woman',
    unicode: '🦹‍♀️',
    category: 'Person',
  },
  {
    alias: ['surfing_man', 'surfer'],
    unicode: '🏄',
    category: 'Activity',
  },
  {
    alias: 'surfing_woman',
    unicode: '🏄‍♀',
    category: 'Activity',
  },
  {
    alias: 'suriname',
    unicode: '🇸🇷',
    category: 'Country',
  },
  {
    alias: 'sushi',
    unicode: '🍣',
    category: 'Food',
  },
  {
    alias: 'suspension_railway',
    unicode: '🚟',
    category: 'Travel',
  },
  {
    alias: 'svalbard_jan_mayen',
    unicode: '🇸🇯',
    category: 'Country',
  },
  {
    alias: 'swan',
    unicode: '🦢',
    category: 'Animal',
  },
  {
    alias: 'swaziland',
    unicode: '🇸🇿',
    category: 'Country',
  },
  {
    alias: 'sweat',
    unicode: '😓',
    category: 'Smiley',
  },
  {
    alias: 'sweat_drops',
    unicode: '💦',
    category: 'Nature',
  },
  {
    alias: 'sweat_smile',
    unicode: '😅',
    category: 'Smiley',
  },
  {
    alias: 'sweden',
    unicode: '🇸🇪',
    category: 'Country',
  },
  {
    alias: 'sweet_potato',
    unicode: '🍠',
    category: 'Food',
  },
  {
    alias: 'swim_brief',
    unicode: '🩲',
    category: 'Activity',
  },
  {
    alias: ['swimming_man', 'swimmer'],
    unicode: '🏊',
    category: 'Activity',
  },
  {
    alias: 'swimming_woman',
    unicode: '🏊‍♀',
    category: 'Activity',
  },
  {
    alias: 'switzerland',
    unicode: '🇨🇭',
    category: 'Country',
  },
  {
    alias: 'symbols',
    unicode: '🔣',
    category: 'Symbol',
  },
  {
    alias: 'synagogue',
    unicode: '🕍',
    category: 'Travel',
  },
  {
    alias: 'syria',
    unicode: '🇸🇾',
    category: 'Country',
  },
  {
    alias: 'syringe',
    unicode: '💉',
    category: 'Object',
  },
  {
    alias: 't-rex',
    unicode: '🦖',
    category: 'Animal',
  },
  {
    alias: 'taco',
    unicode: '🌮',
    category: 'Food',
  },
  {
    alias: 'tada',
    unicode: '🎉',
    category: 'Object',
  },
  {
    alias: 'taiwan',
    unicode: '🇹🇼',
    category: 'Country',
  },
  {
    alias: 'tajikistan',
    unicode: '🇹🇯',
    category: 'Country',
  },
  {
    alias: 'takeout_box',
    unicode: '🥡',
    category: 'Food',
  },
  {
    alias: 'tamale',
    unicode: '🫔',
    category: 'Food',
  },
  {
    alias: 'tanabata_tree',
    unicode: '🎋',
    category: 'Object',
  },
  {
    alias: ['tangerine', 'mandarin', 'orange'],
    unicode: '🍊',
    category: 'Food',
  },
  {
    alias: 'tanzania',
    unicode: '🇹🇿',
    category: 'Country',
  },
  {
    alias: 'taurus',
    unicode: '♉️',
    category: 'Symbol',
  },
  {
    alias: 'taxi',
    unicode: '🚕',
    category: 'Travel',
  },
  {
    alias: 'tea',
    unicode: '🍵',
    category: 'Food',
  },
  {
    alias: 'teacher',
    unicode: '🧑‍🏫',
    category: 'Person',
  },
  {
    alias: 'teapot',
    unicode: '🫖',
    category: 'Food',
  },
  {
    alias: 'technologist',
    unicode: '🧑‍💻',
    category: 'Person',
  },
  {
    alias: 'teddy_bear',
    unicode: '🧸',
    category: 'Object',
  },
  {
    alias: 'telephone_receiver',
    unicode: '📞',
    category: 'Object',
  },
  {
    alias: 'telescope',
    unicode: '🔭',
    category: 'Object',
  },
  {
    alias: 'tennis',
    unicode: '🎾',
    category: 'Activity',
  },
  {
    alias: 'tent',
    unicode: '⛺️',
    category: 'Travel',
  },
  {
    alias: 'test_tube',
    unicode: '🧪',
    category: 'Object',
  },
  {
    alias: 'thailand',
    unicode: '🇹🇭',
    category: 'Country',
  },
  {
    alias: 'thermometer',
    unicode: '🌡',
    category: 'Object',
  },
  {
    alias: 'thinking',
    unicode: '🤔',
    category: 'Smiley',
  },
  {
    alias: 'thong_sandal',
    unicode: '🩴',
    category: 'Clothing',
  },
  {
    alias: 'thought_balloon',
    unicode: '💭',
    category: 'Symbol',
  },
  {
    alias: 'thread',
    unicode: '🧵',
    category: 'Object',
  },
  {
    alias: 'three',
    unicode: '3️⃣',
    category: 'Symbol',
  },
  {
    alias: 'ticket',
    unicode: '🎫',
    category: 'Activity',
  },
  {
    alias: 'tickets',
    unicode: '🎟',
    category: 'Activity',
  },
  {
    alias: 'tiger',
    unicode: '🐯',
    category: 'Animal',
  },
  {
    alias: 'tiger2',
    unicode: '🐅',
    category: 'Animal',
  },
  {
    alias: 'timer_clock',
    unicode: '⏲',
    category: 'Object',
  },
  {
    alias: 'timor_leste',
    unicode: '🇹🇱',
    category: 'Country',
  },
  {
    alias: ['tipping_hand_man', 'sassy_man'],
    unicode: '💁‍♂',
    category: 'Person',
  },
  {
    alias: 'tipping_hand_person',
    unicode: '💁',
    category: 'Person',
  },
  {
    alias: ['tipping_hand_woman', 'information_desk_person', 'sassy_woman'],
    unicode: '💁',
    category: 'Person',
  },
  {
    alias: 'tired_face',
    unicode: '😫',
    category: 'Smiley',
  },
  {
    alias: 'tm',
    unicode: '™️',
    category: 'Symbol',
  },
  {
    alias: 'togo',
    unicode: '🇹🇬',
    category: 'Country',
  },
  {
    alias: 'toilet',
    unicode: '🚽',
    category: 'Object',
  },
  {
    alias: 'tokelau',
    unicode: '🇹🇰',
    category: 'Country',
  },
  {
    alias: 'tokyo_tower',
    unicode: '🗼',
    category: 'Travel',
  },
  {
    alias: 'tomato',
    unicode: '🍅',
    category: 'Food',
  },
  {
    alias: 'tonga',
    unicode: '🇹🇴',
    category: 'Country',
  },
  {
    alias: 'tongue',
    unicode: '👅',
    category: 'Person',
  },
  {
    alias: 'toolbox',
    unicode: '🧰',
    category: 'Object',
  },
  {
    alias: 'tooth',
    unicode: '🦷',
    category: 'Person',
  },
  {
    alias: 'toothbrush',
    unicode: '🪥',
    category: 'Object',
  },
  {
    alias: 'top',
    unicode: '🔝',
    category: 'Symbol',
  },
  {
    alias: 'tophat',
    unicode: '🎩',
    category: 'Object',
  },
  {
    alias: 'tornado',
    unicode: '🌪',
    category: 'Travel',
  },
  {
    alias: 'tr',
    unicode: '🇹🇷',
    category: 'Country',
  },
  {
    alias: 'trackball',
    unicode: '🖲',
    category: 'Object',
  },
  {
    alias: 'tractor',
    unicode: '🚜',
    category: 'Travel',
  },
  {
    alias: 'traffic_light',
    unicode: '🚥',
    category: 'Travel',
  },
  {
    alias: 'train',
    unicode: '🚋',
    category: 'Travel',
  },
  {
    alias: 'train2',
    unicode: '🚆',
    category: 'Travel',
  },
  {
    alias: 'tram',
    unicode: '🚊',
    category: 'Travel',
  },
  {
    alias: 'transgender_flag',
    unicode: '🏳️‍⚧️',
    category: 'Flag',
  },
  {
    alias: 'transgender_symbol',
    unicode: '⚧️',
    category: 'Symbol',
  },
  {
    alias: 'triangular_flag_on_post',
    unicode: '🚩',
    category: 'Flag',
  },
  {
    alias: 'triangular_ruler',
    unicode: '📐',
    category: 'Object',
  },
  {
    alias: 'trident',
    unicode: '🔱',
    category: 'Symbol',
  },
  {
    alias: 'trinidad_tobago',
    unicode: '🇹🇹',
    category: 'Country',
  },
  {
    alias: 'tristan_da_cunha',
    unicode: '🇹🇦',
    category: 'Country',
  },
  {
    alias: 'triumph',
    unicode: '😤',
    category: 'Smiley',
  },
  {
    alias: 'trolleybus',
    unicode: '🚎',
    category: 'Travel',
  },
  {
    alias: 'trophy',
    unicode: '🏆',
    category: 'Activity',
  },
  {
    alias: 'tropical_drink',
    unicode: '🍹',
    category: 'Food',
  },
  {
    alias: 'tropical_fish',
    unicode: '🐠',
    category: 'Animal',
  },
  {
    alias: 'truck',
    unicode: '🚚',
    category: 'Travel',
  },
  {
    alias: 'trumpet',
    unicode: '🎺',
    category: 'Activity',
  },
  {
    alias: 'tulip',
    unicode: '🌷',
    category: 'Nature',
  },
  {
    alias: 'tumbler_glass',
    unicode: '🥃',
    category: 'Food',
  },
  {
    alias: 'tunisia',
    unicode: '🇹🇳',
    category: 'Country',
  },
  {
    alias: 'turkey',
    unicode: '🦃',
    category: 'Animal',
  },
  {
    alias: 'turkmenistan',
    unicode: '🇹🇲',
    category: 'Country',
  },
  {
    alias: 'turks_caicos_islands',
    unicode: '🇹🇨',
    category: 'Country',
  },
  {
    alias: 'turtle',
    unicode: '🐢',
    category: 'Animal',
  },
  {
    alias: 'tuvalu',
    unicode: '🇹🇻',
    category: 'Country',
  },
  {
    alias: 'tv',
    unicode: '📺',
    category: 'Object',
  },
  {
    alias: 'twisted_rightwards_arrows',
    unicode: '🔀',
    category: 'Symbol',
  },
  {
    alias: 'two',
    unicode: '2️⃣',
    category: 'Symbol',
  },
  {
    alias: 'two_hearts',
    unicode: '💕',
    category: 'Symbol',
  },
  {
    alias: 'two_men_holding_hands',
    unicode: '👬',
    category: 'Person',
  },
  {
    alias: 'two_women_holding_hands',
    unicode: '👭',
    category: 'Person',
  },
  {
    alias: 'u5272',
    unicode: '🈹',
    category: 'Symbol',
  },
  {
    alias: 'u5408',
    unicode: '🈴',
    category: 'Symbol',
  },
  {
    alias: 'u55b6',
    unicode: '🈺',
    category: 'Symbol',
  },
  {
    alias: 'u6307',
    unicode: '🈯️',
    category: 'Symbol',
  },
  {
    alias: 'u6708',
    unicode: '🈷️',
    category: 'Symbol',
  },
  {
    alias: 'u6709',
    unicode: '🈶',
    category: 'Symbol',
  },
  {
    alias: 'u6e80',
    unicode: '🈵',
    category: 'Symbol',
  },
  {
    alias: 'u7121',
    unicode: '🈚️',
    category: 'Symbol',
  },
  {
    alias: 'u7533',
    unicode: '🈸',
    category: 'Symbol',
  },
  {
    alias: 'u7981',
    unicode: '🈲',
    category: 'Symbol',
  },
  {
    alias: 'u7a7a',
    unicode: '🈳',
    category: 'Symbol',
  },
  {
    alias: 'uganda',
    unicode: '🇺🇬',
    category: 'Country',
  },
  {
    alias: 'ukraine',
    unicode: '🇺🇦',
    category: 'Country',
  },
  {
    alias: 'umbrella',
    unicode: '☔️',
    category: 'Nature',
  },
  {
    alias: 'unamused',
    unicode: '😒',
    category: 'Smiley',
  },
  {
    alias: 'underage',
    unicode: '🔞',
    category: 'Symbol',
  },
  {
    alias: 'unicorn',
    unicode: '🦄',
    category: 'Animal',
  },
  {
    alias: 'united_arab_emirates',
    unicode: '🇦🇪',
    category: 'Country',
  },
  {
    alias: 'united_nations',
    unicode: '🇺🇳',
    category: 'Country',
  },
  {
    alias: 'unlock',
    unicode: '🔓',
    category: 'Object',
  },
  {
    alias: 'up',
    unicode: '🆙',
    category: 'Symbol',
  },
  {
    alias: 'upside_down_face',
    unicode: '🙃',
    category: 'Smiley',
  },
  {
    alias: 'uruguay',
    unicode: '🇺🇾',
    category: 'Country',
  },
  {
    alias: 'us',
    unicode: '🇺🇸',
    category: 'Country',
  },
  {
    alias: 'us_outlying_islands',
    unicode: '🇺🇲',
    category: 'Country',
  },
  {
    alias: 'us_virgin_islands',
    unicode: '🇻🇮',
    category: 'Country',
  },
  {
    alias: 'uzbekistan',
    unicode: '🇺🇿',
    category: 'Country',
  },
  {
    alias: 'v',
    unicode: '✌️',
    category: 'Gesture',
  },
  {
    alias: 'vampire',
    unicode: '🧛',
    category: 'Person',
  },
  {
    alias: 'vampire_man',
    unicode: '🧛‍♂️',
    category: 'Person',
  },
  {
    alias: 'vampire_woman',
    unicode: '🧛‍♀️',
    category: 'Person',
  },
  {
    alias: 'vanuatu',
    unicode: '🇻🇺',
    category: 'Country',
  },
  {
    alias: 'vatican_city',
    unicode: '🇻🇦',
    category: 'Country',
  },
  {
    alias: 'venezuela',
    unicode: '🇻🇪',
    category: 'Country',
  },
  {
    alias: 'vertical_traffic_light',
    unicode: '🚦',
    category: 'Travel',
  },
  {
    alias: 'vhs',
    unicode: '📼',
    category: 'Object',
  },
  {
    alias: 'vibration_mode',
    unicode: '📳',
    category: 'Symbol',
  },
  {
    alias: 'video_camera',
    unicode: '📹',
    category: 'Object',
  },
  {
    alias: 'video_game',
    unicode: '🎮',
    category: 'Activity',
  },
  {
    alias: 'vietnam',
    unicode: '🇻🇳',
    category: 'Country',
  },
  {
    alias: 'violin',
    unicode: '🎻',
    category: 'Activity',
  },
  {
    alias: 'virgo',
    unicode: '♍️',
    category: 'Symbol',
  },
  {
    alias: 'volcano',
    unicode: '🌋',
    category: 'Nature',
  },
  {
    alias: 'volleyball',
    unicode: '🏐',
    category: 'Activity',
  },
  {
    alias: 'vomiting_face',
    unicode: '🤮',
    category: 'Smiley',
  },
  {
    alias: 'vs',
    unicode: '🆚',
    category: 'Symbol',
  },
  {
    alias: 'vulcan_salute',
    unicode: '🖖',
    category: 'Gesture',
  },
  {
    alias: 'waffle',
    unicode: '🧇',
    category: 'Food',
  },
  {
    alias: 'wales',
    unicode: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    category: 'Country',
  },
  {
    alias: ['walking_man', 'walking'],
    unicode: '🚶',
    category: 'Person',
  },
  {
    alias: 'walking_woman',
    unicode: '🚶‍♀',
    category: 'Person',
  },
  {
    alias: 'wallis_futuna',
    unicode: '🇼🇫',
    category: 'Country',
  },
  {
    alias: 'waning_crescent_moon',
    unicode: '🌘',
    category: 'Nature',
  },
  {
    alias: 'waning_gibbous_moon',
    unicode: '🌖',
    category: 'Nature',
  },
  {
    alias: 'warning',
    unicode: '⚠️',
    category: 'Symbol',
  },
  {
    alias: 'wastebasket',
    unicode: '🗑',
    category: 'Object',
  },
  {
    alias: 'watch',
    unicode: '⌚️',
    category: 'Object',
  },
  {
    alias: 'water_buffalo',
    unicode: '🐃',
    category: 'Animal',
  },
  {
    alias: 'water_polo',
    unicode: '🤽',
    category: 'Activity',
  },
  {
    alias: 'watermelon',
    unicode: '🍉',
    category: 'Food',
  },
  {
    alias: 'wave',
    unicode: '👋',
    category: 'Gesture',
  },
  {
    alias: 'wavy_dash',
    unicode: '〰️',
    category: 'Symbol',
  },
  {
    alias: 'waxing_crescent_moon',
    unicode: '🌒',
    category: 'Nature',
  },
  {
    alias: 'wc',
    unicode: '🚾',
    category: 'Symbol',
  },
  {
    alias: 'weary',
    unicode: '😩',
    category: 'Smiley',
  },
  {
    alias: 'wedding',
    unicode: '💒',
    category: 'Travel',
  },
  {
    alias: 'weight_lifting',
    unicode: '🏋️',
    category: 'Activity',
  },
  {
    alias: 'weight_lifting_man',
    unicode: '🏋',
    category: 'Activity',
  },
  {
    alias: 'weight_lifting_woman',
    unicode: '🏋️‍♀️',
    category: 'Activity',
  },
  {
    alias: 'western_sahara',
    unicode: '🇪🇭',
    category: 'Country',
  },
  {
    alias: 'whale',
    unicode: '🐳',
    category: 'Animal',
  },
  {
    alias: 'whale2',
    unicode: '🐋',
    category: 'Animal',
  },
  {
    alias: 'wheel_of_dharma',
    unicode: '☸️',
    category: 'Symbol',
  },
  {
    alias: 'wheelchair',
    unicode: '♿️',
    category: 'Symbol',
  },
  {
    alias: 'white_check_mark',
    unicode: '✅',
    category: 'Symbol',
  },
  {
    alias: 'white_circle',
    unicode: '⚪️',
    category: 'Symbol',
  },
  {
    alias: 'white_flag',
    unicode: '🏳️',
    category: 'Flag',
  },
  {
    alias: 'white_flower',
    unicode: '💮',
    category: 'Symbol',
  },
  {
    alias: 'white_haired_man',
    unicode: '👨‍🦳',
    category: 'Person',
  },
  {
    alias: 'white_haired_woman',
    unicode: '👩‍🦳',
    category: 'Person',
  },
  {
    alias: 'white_heart',
    unicode: '🤍',
    category: 'Symbol',
  },
  {
    alias: 'white_large_square',
    unicode: '⬜️',
    category: 'Symbol',
  },
  {
    alias: 'white_medium_small_square',
    unicode: '◽️',
    category: 'Symbol',
  },
  {
    alias: 'white_medium_square',
    unicode: '◻️',
    category: 'Symbol',
  },
  {
    alias: 'white_small_square',
    unicode: '▫️',
    category: 'Symbol',
  },
  {
    alias: 'white_square_button',
    unicode: '🔳',
    category: 'Symbol',
  },
  {
    alias: 'wilted_flower',
    unicode: '🥀',
    category: 'Nature',
  },
  {
    alias: 'wind_chime',
    unicode: '🎐',
    category: 'Object',
  },
  {
    alias: 'wind_face',
    unicode: '🌬',
    category: 'Nature',
  },
  {
    alias: 'window',
    unicode: '🪟',
    category: 'Travel',
  },
  {
    alias: 'wine_glass',
    unicode: '🍷',
    category: 'Food',
  },
  {
    alias: 'wink',
    unicode: '😉',
    category: 'Smiley',
  },
  {
    alias: 'wolf',
    unicode: '🐺',
    category: 'Animal',
  },
  {
    alias: 'woman',
    unicode: '👩',
    category: 'Person',
  },
  {
    alias: 'woman_artist',
    unicode: '👩‍🎨',
    category: 'Person',
  },
  {
    alias: 'woman_astronaut',
    unicode: '👩‍🚀',
    category: 'Person',
  },
  {
    alias: 'woman_beard',
    unicode: '🧔‍♀️',
    category: 'Person',
  },
  {
    alias: 'woman_cartwheeling',
    unicode: '🤸‍♀',
    category: 'Activity',
  },
  {
    alias: 'woman_cook',
    unicode: '👩‍🍳',
    category: 'Person',
  },
  {
    alias: 'woman_dancing',
    unicode: '💃',
    category: 'Person',
  },
  {
    alias: 'woman_facepalming',
    unicode: '🤦‍♀',
    category: 'Person',
  },
  {
    alias: 'woman_factory_worker',
    unicode: '👩‍🏭',
    category: 'Person',
  },
  {
    alias: 'woman_farmer',
    unicode: '👩‍🌾',
    category: 'Person',
  },
  {
    alias: 'woman_feeding_baby',
    unicode: '👩‍🍼',
    category: 'Person',
  },
  {
    alias: 'woman_firefighter',
    unicode: '👩‍🚒',
    category: 'Person',
  },
  {
    alias: 'woman_health_worker',
    unicode: '👩‍⚕',
    category: 'Person',
  },
  {
    alias: 'woman_in_manual_wheelchair',
    unicode: '👩‍🦽',
    category: 'Person',
  },
  {
    alias: 'woman_in_motorized_wheelchair',
    unicode: '👩‍🦼',
    category: 'Person',
  },
  {
    alias: 'woman_in_tuxedo',
    unicode: '🤵‍♀️',
    category: 'Person',
  },
  {
    alias: 'woman_judge',
    unicode: '👩‍⚖',
    category: 'Person',
  },
  {
    alias: 'woman_juggling',
    unicode: '🤹‍♀',
    category: 'Activity',
  },
  {
    alias: 'woman_mechanic',
    unicode: '👩‍🔧',
    category: 'Person',
  },
  {
    alias: 'woman_office_worker',
    unicode: '👩‍💼',
    category: 'Person',
  },
  {
    alias: 'woman_pilot',
    unicode: '👩‍✈',
    category: 'Person',
  },
  {
    alias: 'woman_playing_handball',
    unicode: '🤾‍♀',
    category: 'Activity',
  },
  {
    alias: 'woman_playing_water_polo',
    unicode: '🤽‍♀',
    category: 'Activity',
  },
  {
    alias: 'woman_scientist',
    unicode: '👩‍🔬',
    category: 'Person',
  },
  {
    alias: 'woman_shrugging',
    unicode: '🤷‍♀',
    category: 'Person',
  },
  {
    alias: 'woman_singer',
    unicode: '👩‍🎤',
    category: 'Person',
  },
  {
    alias: 'woman_student',
    unicode: '👩‍🎓',
    category: 'Person',
  },
  {
    alias: 'woman_teacher',
    unicode: '👩‍🏫',
    category: 'Person',
  },
  {
    alias: 'woman_technologist',
    unicode: '👩‍💻',
    category: 'Person',
  },
  {
    alias: 'woman_with_headscarf',
    unicode: '🧕',
    category: 'Person',
  },
  {
    alias: 'woman_with_probing_cane',
    unicode: '👩‍🦯',
    category: 'Person',
  },
  {
    alias: 'woman_with_turban',
    unicode: '👳‍♀',
    category: 'Person',
  },
  {
    alias: 'woman_with_veil',
    unicode: '👰‍♀️',
    category: 'Person',
  },
  {
    alias: 'womans_clothes',
    unicode: '👚',
    category: 'Clothing',
  },
  {
    alias: 'womans_hat',
    unicode: '👒',
    category: 'Clothing',
  },
  {
    alias: 'women_wrestling',
    unicode: '🤼‍♀',
    category: 'Activity',
  },
  {
    alias: 'womens',
    unicode: '🚺',
    category: 'Symbol',
  },
  {
    alias: 'wood',
    unicode: '🪵',
    category: 'Nature',
  },
  {
    alias: 'woozy_face',
    unicode: '🥴',
    category: 'Smiley',
  },
  {
    alias: 'world_map',
    unicode: '🗺',
    category: 'Travel',
  },
  {
    alias: 'worm',
    unicode: '🪱',
    category: 'Animal',
  },
  {
    alias: 'worried',
    unicode: '😟',
    category: 'Smiley',
  },
  {
    alias: 'wrench',
    unicode: '🔧',
    category: 'Object',
  },
  {
    alias: 'wrestling',
    unicode: '🤼',
    category: 'Activity',
  },
  {
    alias: 'writing_hand',
    unicode: '✍️',
    category: 'Gesture',
  },
  {
    alias: 'x',
    unicode: '❌',
    category: 'Symbol',
  },
  {
    alias: 'yarn',
    unicode: '🧶',
    category: 'Object',
  },
  {
    alias: 'yawning_face',
    unicode: '🥱',
    category: 'Smiley',
  },
  {
    alias: 'yellow_circle',
    unicode: '🟡',
    category: 'Symbol',
  },
  {
    alias: 'yellow_heart',
    unicode: '💛',
    category: 'Symbol',
  },
  {
    alias: 'yellow_square',
    unicode: '🟨',
    category: 'Symbol',
  },
  {
    alias: 'yemen',
    unicode: '🇾🇪',
    category: 'Country',
  },
  {
    alias: 'yen',
    unicode: '💴',
    category: 'Object',
  },
  {
    alias: 'yin_yang',
    unicode: '☯️',
    category: 'Symbol',
  },
  {
    alias: 'yo_yo',
    unicode: '🪀',
    category: 'Activity',
  },
  {
    alias: 'yum',
    unicode: '😋',
    category: 'Smiley',
  },
  {
    alias: 'zambia',
    unicode: '🇿🇲',
    category: 'Country',
  },
  {
    alias: 'zany_face',
    unicode: '🤪',
    category: 'Smiley',
  },
  {
    alias: 'zap',
    unicode: '⚡️',
    category: 'Nature',
  },
  {
    alias: 'zebra',
    unicode: '🦓',
    category: 'Animal',
  },
  {
    alias: 'zero',
    unicode: '0️⃣',
    category: 'Symbol',
  },
  {
    alias: 'zimbabwe',
    unicode: '🇿🇼',
    category: 'Country',
  },
  {
    alias: 'zipper_mouth_face',
    unicode: '🤐',
    category: 'Smiley',
  },
  {
    alias: 'zombie',
    unicode: '🧟',
    category: 'Person',
  },
  {
    alias: 'zombie_man',
    unicode: '🧟‍♂️',
    category: 'Person',
  },
  {
    alias: 'zombie_woman',
    unicode: '🧟‍♀️',
    category: 'Person',
  },
  {
    alias: 'zzz',
    unicode: '💤',
    category: 'Symbol',
  },
];

export default emoji;

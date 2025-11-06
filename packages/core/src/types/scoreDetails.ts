/**
 * Score privacy settings
 */
export type ScorePrivacy =
	| "public"
	| "private"
	| "organizationPublic"
	| "privateLink";

/**
 * License types for scores
 */
export type ScoreLicense =
	| "copyright"
	| "cc0"
	| "cc-by"
	| "cc-by-sa"
	| "cc-by-nd"
	| "cc-by-nc"
	| "cc-by-nc-sa"
	| "cc-by-nc-nd"
	| null;

/**
 * Score creation type
 */
export type ScoreCreationType = "original" | "arrangement" | "other" | null;

/**
 * User public information
 */
export interface UserPublic {
	/** The unique identifier of the user */
	id: string;
	/** The user's username */
	username: string;
	/** The URL of the user's avatar */
	picture?: string;
	/** The user's display name */
	name?: string;
}

/**
 * Resource access rights
 */
export interface ResourceRights {
	/** Can read the resource */
	read?: boolean;
	/** Can write/edit the resource */
	write?: boolean;
	/** Can manage the resource (change permissions, delete, etc.) */
	admin?: boolean;
}

/**
 * Resource collaborator information
 */
export interface ResourceCollaborator extends ResourceRights {
	/** The user information */
	user: UserPublic;
}

/**
 * Score likes statistics
 */
export interface ScoreLikesCounts {
	/** Total number of likes */
	total: number;
	/** Number of likes in the last week */
	weekly?: number;
	/** Number of likes in the last month */
	monthly?: number;
}

/**
 * Score comments statistics
 */
export interface ScoreCommentsCounts {
	/** Total number of comments */
	total: number;
	/** Number of unresolved comments */
	unresolved?: number;
}

/**
 * Score views statistics
 */
export interface ScoreViewsCounts {
	/** Total number of views */
	total: number;
	/** Number of views in the last week */
	weekly?: number;
	/** Number of views in the last month */
	monthly?: number;
}

/**
 * Score plays statistics
 */
export interface ScorePlaysCounts {
	/** Total number of plays */
	total: number;
	/** Number of plays in the last week */
	weekly?: number;
	/** Number of plays in the last month */
	monthly?: number;
}

/**
 * Complete score details including metadata and statistics
 */
export interface ScoreDetails {
	/** The unique identifier of the score */
	id: string;
	/** The private sharing key of the score (available when the `privacy` mode is set to `privateLink`) */
	sharingKey?: string;
	/** The title of the score */
	title: string;
	/** Privacy setting of the score */
	privacy: ScorePrivacy;
	/** User who created the score */
	user: UserPublic;
	/** The url where the score can be viewed in a web browser */
	htmlUrl: string;
	/** The url where the score can be edited in a web browser */
	editHtmlUrl: string;
	/** Subtitle of the score */
	subtitle?: string;
	/** Lyricist of the score */
	lyricist?: string;
	/** Arranger of the score */
	arranger?: string;
	/** Composer of the score */
	composer?: string;
	/** Description of the creation */
	description?: string;
	/** Tags describing the score */
	tags?: string[];
	/** Type of creation */
	creationType?: ScoreCreationType;
	/** License of the score */
	license?: ScoreLicense;
	/** Additional license text written on the exported/printed score */
	licenseText?: string;
	/** In seconds, an approximative duration of the score */
	durationTime?: number;
	/** The number of measures in the score */
	numberMeasures?: number;
	/** The main tempo of the score (in QPM) */
	mainTempoQpm?: number;
	/** The main key signature of the score (expressed between -7 and 7). */
	mainKeySignature?: number;
	/** Access rights for the score */
	rights?: ResourceRights;
	/** The list of the collaborators of the score */
	collaborators: ResourceCollaborator[];
	/** The date when the score was created */
	creationDate: string;
	/** The date of the last revision of the score */
	modificationDate?: string;
	/** The date when the score was published on Flat */
	publicationDate?: string;
	/**
	 * The date when the score will be definitively deleted.
	 * This date can be in the past if the score will be deleted at the next deletion batch.
	 */
	scheduledDeletionDate?: string;
	/** The date when the score was highlighted (featured) on our community */
	highlightedDate?: string;
	/** If the score has been created in an organization, the identifier of this organization */
	organization?: string;
	/** If the score has been forked, the unique identifier of the parent score */
	parentScore?: string;
	/**
	 * An array of the instrument identifiers used in the last version of the score.
	 * The format of the strings is `{instrument-group}.{instrument-id}`.
	 */
	instruments: string[];
	/** An array of the instrument names that match the indexes from the `instruments` list */
	instrumentsNames: string[];
	/**
	 * An array of the audio samples identifiers used in the different score parts.
	 * The format of the strings is `{instrument-group}.{sample-id}`.
	 */
	samples: string[];
	/** If the score exists on Google Drive, this field will contain the unique identifier */
	googleDriveFileId?: string;
	/** Like statistics */
	likes?: ScoreLikesCounts;
	/** Comment statistics */
	comments?: ScoreCommentsCounts;
	/** View statistics */
	views?: ScoreViewsCounts;
	/** Play statistics */
	plays?: ScorePlaysCounts;
	/** The list of parent collections which includes all the collections this score is included in */
	collections?: string[];
}

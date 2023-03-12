import type { Enum } from "../enum";

export const match =
	<T extends object>(target: T) =>
	<
		E extends Enum.Root<T>,
		M extends Partial<{
			[K in keyof E]: (
				value: E[K] extends { value: infer X } ? X : E[K]
			) => unknown;
		}>,
		F extends (value: Enum<Omit<Enum.Root<T>, keyof M>>) => unknown
	>(
		mapper: M,
		fallback: F
	):
		| {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				[K in keyof M]: M[K] extends (...args: any[]) => any
					? ReturnType<M[K]>
					: never;
		  }[keyof M]
		| ReturnType<F> => {
		const variant = Object.keys(target)[0];
		if (!variant) {
			throw new TypeError(`match(target=${target}) is invalid enum`);
		}
		if (Object.keys(mapper).includes(variant)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const mapperVariant = mapper[variant as keyof typeof mapper]!;
			const variantValue = target[variant as keyof typeof target];
			if ("value" in variantValue) {
				// @ts-expect-error Lazy.
				return mapperVariant(variantValue.value);
			}
			// @ts-expect-error Lazy.
			return mapperVariant(true);
		}
		// @ts-expect-error Lazy.
		return fallback(target);
	};

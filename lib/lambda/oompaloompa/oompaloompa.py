import boto3
sc = boto3.client('servicecatalog')


def on_event(event, context):
	props = event["ResourceProperties"]
	print("create new resource with props %s" % props)
	message = event['ResourceProperties']['RERUN']

	product_id = sc.search_products_as_admin(
		Filters={
			'FullTextSearch': ['AWS Control Tower Account Factory']
		},
	)['ProductViewDetails'][0]['ProductViewSummary']['ProductId']
	
	artifact_id = sc.describe_product_as_admin(
		Id = product_id
	)['ProvisioningArtifactSummaries'][0]['Id']
	

	attributes = {
		'ProductId': product_id,	
		'ArtifactId': artifact_id
	}
	return { 'Data': attributes }